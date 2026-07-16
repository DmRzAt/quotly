import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/user";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let seller = await prisma.sellerAccount.findUnique({
    where: { userId: user.id },
  });

  if (!seller) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    seller = await prisma.sellerAccount.create({
      data: { userId: user.id, stripeAccountId: account.id },
    });
  }

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  const link = await stripe.accountLinks.create({
    account: seller.stripeAccountId,
    refresh_url: `${origin}/seller/onboard/refresh`,
    return_url: `${origin}/seller`,
    type: "account_onboarding",
  });

  return Response.json({ url: link.url });
}
