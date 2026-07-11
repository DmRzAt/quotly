import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { priceIdForPlan } from "@/lib/plans";
import { getAppUser } from "@/lib/user";

export async function POST(req: Request) {
  const user = await getAppUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const plan = body?.plan;
  if (plan !== "PRO" && plan !== "UNLIMITED") {
    return Response.json({ error: "Invalid plan" }, { status: 400 });
  }

  // Create the Stripe customer up front so the customer id is stored
  // before any webhook arrives (and Customer Portal works immediately).
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceIdForPlan(plan), quantity: 1 }],
    success_url: `${origin}/dashboard?success=1`,
    cancel_url: `${origin}/pricing`,
    // Critical: this is how the webhook links the Stripe event back to
    // our user.
    metadata: { userId: user.id },
    subscription_data: { metadata: { userId: user.id } },
  });

  return Response.json({ url: session.url });
}
