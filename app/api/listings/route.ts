import { prisma } from "@/lib/prisma";
import { generatePalette } from "@/lib/generator";
import { getCurrentUser } from "@/lib/user";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const seller = await prisma.sellerAccount.findUnique({
    where: { userId: user.id },
  });
  if (!seller?.chargesEnabled) {
    return Response.json(
      { error: "Complete Stripe onboarding first" },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const phrase = typeof body?.phrase === "string" ? body.phrase.trim() : "";
  const priceCents = Number(body?.priceCents);

  if (!title || title.length > 80) {
    return Response.json({ error: "Invalid title" }, { status: 400 });
  }
  if (!phrase || phrase.length > 200) {
    return Response.json({ error: "Invalid phrase" }, { status: 400 });
  }
  if (!Number.isInteger(priceCents) || priceCents < 100 || priceCents > 100000) {
    return Response.json(
      { error: "Price must be between $1 and $1000" },
      { status: 400 },
    );
  }

  const listing = await prisma.listing.create({
    data: {
      sellerId: seller.id,
      title,
      priceCents,
      paletteData: JSON.stringify(generatePalette(phrase)),
    },
  });

  return Response.json({ id: listing.id });
}
