import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PaletteStrip } from "@/components/palette-strip";
import { formatUsd } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user";

export default async function PurchasesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const purchases = await prisma.purchase.findMany({
    where: { buyerId: user.id, status: "succeeded" },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your purchases</h1>
        <p className="text-muted-foreground">
          Palettes you bought on the marketplace.
        </p>
      </div>

      {purchases.length === 0 && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted-foreground">
            Nothing here yet — browse the marketplace to find a palette.
          </p>
          <Button render={<Link href="/marketplace" />}>
            Open marketplace
          </Button>
        </div>
      )}

      {purchases.map((purchase) => (
        <Card key={purchase.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                {purchase.listing.title}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {formatUsd(purchase.amountCents)} ·{" "}
                {purchase.createdAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <PaletteStrip colors={JSON.parse(purchase.listing.paletteData)} />
            <p className="font-mono text-xs text-muted-foreground">
              {(JSON.parse(purchase.listing.paletteData) as string[]).join(
                "  ",
              )}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
