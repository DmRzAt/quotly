import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { planFromPriceId } from "@/lib/plans";

export async function POST(req: Request) {
  // Raw body, not req.json() — Stripe verifies the signature against
  // the exact bytes it sent.
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return new Response("Bad signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription) break;

      const sub = await stripe.subscriptions.retrieve(
        session.subscription as string,
      );

      // Keep the customer id in sync even if checkout was started
      // before we stored it.
      if (typeof session.customer === "string") {
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: session.customer },
        });
      }

      // upsert, not create — Stripe retries webhooks, so this handler
      // must be idempotent.
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          ...subscriptionData(sub),
        },
        update: subscriptionData(sub),
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      // updateMany: no throw if we never saw this subscription
      // (e.g. events replayed from before the DB existed).
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: subscriptionData(sub),
      });
      break;
    }
  }

  return Response.json({ received: true });
}

function subscriptionData(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    stripeSubscriptionId: sub.id,
    stripePriceId: item.price.id,
    status: sub.status,
    plan: planFromPriceId(item.price.id),
    // Since the Basil API version, current_period_end lives on the
    // subscription item, not the subscription.
    currentPeriodEnd: new Date(item.current_period_end * 1000),
  };
}
