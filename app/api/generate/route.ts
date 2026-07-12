import { prisma } from "@/lib/prisma";
import { generatePalette } from "@/lib/generator";
import { PLAN_LIMITS, currentMonthStart, resolvePlan } from "@/lib/plans";
import { getCurrentUser } from "@/lib/user";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  const plan = resolvePlan(sub);
  const limit = PLAN_LIMITS[plan];

  const used = await prisma.generation.count({
    where: { userId: user.id, createdAt: { gte: currentMonthStart() } },
  });

  if (used >= limit) {
    return Response.json(
      { error: "Quota exceeded", plan, used, limit: toJsonLimit(limit) },
      { status: 402 },
    );
  }

  const body = await req.json().catch(() => null);
  const input = typeof body?.input === "string" ? body.input.trim() : "";
  if (!input || input.length > 200) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const output = generatePalette(input);

  await prisma.generation.create({
    data: { userId: user.id, input, output: JSON.stringify(output) },
  });

  return Response.json({
    output,
    plan,
    used: used + 1,
    limit: toJsonLimit(limit),
  });
}

function toJsonLimit(limit: number): number | null {
  return Number.isFinite(limit) ? limit : null;
}
