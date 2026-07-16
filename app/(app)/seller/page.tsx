import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateListingForm } from "@/components/create-listing-form";
import { PaletteStrip } from "@/components/palette-strip";
import { SellerOnboardButton } from "@/components/seller-onboard-button";
import { formatUsd } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { syncSellerStatus } from "@/lib/seller";
import { getCurrentUser } from "@/lib/user";

export default async function SellerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  let seller = await prisma.sellerAccount.findUnique({
    where: { userId: user.id },
  });

  if (seller && !seller.chargesEnabled) {
    seller = await syncSellerStatus(seller.id);
  }

  const listings = seller
    ? await prisma.listing.findMany({
        where: { sellerId: seller.id },
        include: { purchases: { where: { status: "succeeded" } } },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Seller dashboard</h1>
        <p className="text-muted-foreground">
          Sell your palettes — 90% goes to you, 10% to the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Stripe account</CardTitle>
            {seller ? (
              <Badge variant={seller.chargesEnabled ? "default" : "outline"}>
                {seller.chargesEnabled ? "Active" : "Onboarding incomplete"}
              </Badge>
            ) : (
              <Badge variant="outline">Not connected</Badge>
            )}
          </div>
          <CardDescription>
            {seller
              ? `Charges: ${seller.chargesEnabled ? "enabled" : "disabled"} · Payouts: ${seller.payoutsEnabled ? "enabled" : "disabled"}`
              : "Connect a Stripe Express account to start selling."}
          </CardDescription>
        </CardHeader>
        {!seller?.chargesEnabled && (
          <CardFooter>
            <SellerOnboardButton
              label={seller ? "Continue onboarding" : "Become a seller"}
            />
          </CardFooter>
        )}
      </Card>

      {seller?.chargesEnabled && (
        <>
          <CreateListingForm />

          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold">Your listings</h2>
            {listings.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No listings yet — create your first one above.
              </p>
            )}
            {listings.map((listing) => {
              const salesCents = listing.purchases.reduce(
                (sum, p) => sum + p.amountCents,
                0,
              );
              const feesCents = listing.purchases.reduce(
                (sum, p) => sum + p.platformFeeCents,
                0,
              );
              return (
                <Card key={listing.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {listing.title}
                      </CardTitle>
                      <span className="font-medium">
                        {formatUsd(listing.priceCents)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <PaletteStrip
                      colors={JSON.parse(listing.paletteData)}
                      className="h-10"
                    />
                    <p className="text-sm text-muted-foreground">
                      {listing.purchases.length} sale
                      {listing.purchases.length === 1 ? "" : "s"} ·{" "}
                      {formatUsd(salesCents)} total · you keep{" "}
                      {formatUsd(salesCents - feesCents)} · platform fee{" "}
                      {formatUsd(feesCents)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
