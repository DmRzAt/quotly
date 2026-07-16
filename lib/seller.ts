import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function syncSellerStatus(sellerId: string) {
  const seller = await prisma.sellerAccount.findUnique({
    where: { id: sellerId },
  });
  if (!seller) return null;

  const account = await stripe.accounts.retrieve(seller.stripeAccountId);

  return prisma.sellerAccount.update({
    where: { id: seller.id },
    data: {
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
    },
  });
}
