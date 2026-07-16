import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BuyButton } from "@/components/buy-button";
import { PaletteStrip } from "@/components/palette-strip";
import { formatUsd } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export default async function MarketplacePage() {
  const listings = await prisma.listing.findMany({
    where: { active: true, seller: { chargesEnabled: true } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground">
          Palettes made by sellers. 90% of every sale goes to the seller, 10%
          to the platform — split by Stripe Connect.
        </p>
      </div>

      {listings.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No listings yet. Be the first — become a seller from your dashboard.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {listings.map((listing) => (
          <Card key={listing.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{listing.title}</CardTitle>
                <span className="font-medium">
                  {formatUsd(listing.priceCents)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <PaletteStrip colors={JSON.parse(listing.paletteData)} />
              <div className="self-end">
                <BuyButton listingId={listing.id} label="Buy" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
