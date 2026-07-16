import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/user";

const PLATFORM_FEE_PERCENT = 10;

export async function POST(req: Request) {
  const buyer = await getCurrentUser();
  if (!buyer) return new Response("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => null);
  const listingId = typeof body?.listingId === "string" ? body.listingId : "";
  if (!listingId) {
    return Response.json({ error: "Invalid listing" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: true },
  });

  if (!listing?.active || !listing.seller.chargesEnabled) {
    return Response.json({ error: "Not available" }, { status: 400 });
  }
  if (listing.seller.userId === buyer.id) {
    return Response.json(
      { error: "You cannot buy your own listing" },
      { status: 400 },
    );
  }

  const feeCents = Math.round(
    (listing.priceCents * PLATFORM_FEE_PERCENT) / 100,
  );

  const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: listing.title },
          unit_amount: listing.priceCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: feeCents,
      transfer_data: {
        destination: listing.seller.stripeAccountId,
      },
    },
    metadata: {
      listingId: listing.id,
      buyerId: buyer.id,
      platformFeeCents: String(feeCents),
    },
    success_url: `${origin}/purchases?success=1`,
    cancel_url: `${origin}/marketplace`,
  });

  return Response.json({ url: session.url });
}
