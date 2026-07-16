import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/user";

export async function GET(req: Request) {
  const { origin } = new URL(req.url);

  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${origin}/`);

  const seller = await prisma.sellerAccount.findUnique({
    where: { userId: user.id },
  });
  if (!seller) return NextResponse.redirect(`${origin}/seller`);

  const link = await stripe.accountLinks.create({
    account: seller.stripeAccountId,
    refresh_url: `${origin}/seller/onboard/refresh`,
    return_url: `${origin}/seller`,
    type: "account_onboarding",
  });

  return NextResponse.redirect(link.url);
}
