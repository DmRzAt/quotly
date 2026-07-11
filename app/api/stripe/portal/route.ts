import { stripe } from "@/lib/stripe";
import { getAppUser } from "@/lib/user";

export async function POST(req: Request) {
  const user = await getAppUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!user.stripeCustomerId) {
    return Response.json({ error: "No billing account" }, { status: 400 });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/billing`,
  });

  return Response.json({ url: session.url });
}
