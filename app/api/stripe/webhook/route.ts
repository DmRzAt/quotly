import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { planFromPriceId } from "@/lib/plans";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
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

      if (typeof session.customer === "string") {
        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: session.customer },
        });
      }

      await prisma.subscription.upsert({
        where: { userId },
        create: { userId, ...toSubscriptionRecord(sub) },
        update: toSubscriptionRecord(sub),
      });
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object;
      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: sub.id },
        data: toSubscriptionRecord(sub),
      });
      break;
    }
  }

  return Response.json({ received: true });
}

function toSubscriptionRecord(sub: Stripe.Subscription) {
  const item = sub.items.data[0];
  return {
    stripeSubscriptionId: sub.id,
    stripePriceId: item.price.id,
    status: sub.status,
    plan: planFromPriceId(item.price.id),
    currentPeriodEnd: new Date(item.current_period_end * 1000),
  };
}
