import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { planFromPriceId } from "@/lib/plans";

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const event = verifyStripeEvent(payload, signature);
  if (!event) return new Response("Bad signature", { status: 400 });

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.mode === "subscription") {
        await applySubscriptionCheckout(session);
      } else if (session.mode === "payment") {
        await applyPurchaseCheckout(session);
      }
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

    case "account.updated": {
      const account = event.data.object;
      await prisma.sellerAccount.updateMany({
        where: { stripeAccountId: account.id },
        data: {
          chargesEnabled: account.charges_enabled ?? false,
          payoutsEnabled: account.payouts_enabled ?? false,
          detailsSubmitted: account.details_submitted ?? false,
        },
      });
      break;
    }
  }

  return Response.json({ received: true });
}

function verifyStripeEvent(
  payload: string,
  signature: string,
): Stripe.Event | null {
  const secrets = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
  ].filter((secret): secret is string => Boolean(secret));

  for (const secret of secrets) {
    try {
      return stripe.webhooks.constructEvent(payload, signature, secret);
    } catch {
      continue;
    }
  }
  return null;
}

async function applySubscriptionCheckout(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  if (!userId || !session.subscription) return;

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
}

async function applyPurchaseCheckout(session: Stripe.Checkout.Session) {
  const buyerId = session.metadata?.buyerId;
  const listingId = session.metadata?.listingId;
  const paymentIntentId = session.payment_intent;
  if (!buyerId || !listingId || typeof paymentIntentId !== "string") return;

  await prisma.purchase.upsert({
    where: { stripePaymentIntentId: paymentIntentId },
    create: {
      buyerId,
      listingId,
      stripePaymentIntentId: paymentIntentId,
      amountCents: session.amount_total ?? 0,
      platformFeeCents: Number(session.metadata?.platformFeeCents ?? 0),
      status: "succeeded",
    },
    update: { status: "succeeded" },
  });
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
