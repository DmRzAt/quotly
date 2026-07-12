import { redirect } from "next/navigation";
import { Generator } from "@/components/generator";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, currentMonthStart, resolvePlan } from "@/lib/plans";
import { getCurrentUser } from "@/lib/user";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  const plan = resolvePlan(sub);
  const limit = PLAN_LIMITS[plan];

  const used = await prisma.generation.count({
    where: { userId: user.id, createdAt: { gte: currentMonthStart() } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generate a palette</h1>
        <p className="text-muted-foreground">
          Type anything — the same input always produces the same palette.
        </p>
      </div>
      <Generator
        initialUsed={used}
        limit={Number.isFinite(limit) ? limit : null}
        plan={plan}
      />
    </div>
  );
}
