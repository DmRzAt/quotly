import type { Plan } from "@prisma/client";

export const PLAN_LIMITS: Record<Plan, number> = {
  FREE: 5,
  PRO: 100,
  UNLIMITED: Infinity,
};

export const PLAN_META: Record<
  Plan,
  { name: string; price: number; blurb: string }
> = {
  FREE: { name: "Free", price: 0, blurb: "5 palettes per month" },
  PRO: { name: "Pro", price: 9, blurb: "100 palettes per month" },
  UNLIMITED: { name: "Unlimited", price: 29, blurb: "No limits" },
};

export function priceIdForPlan(plan: "PRO" | "UNLIMITED"): string {
  const id =
    plan === "PRO"
      ? process.env.STRIPE_PRICE_PRO
      : process.env.STRIPE_PRICE_UNLIMITED;
  if (!id) throw new Error(`Missing Stripe price id for plan ${plan}`);
  return id;
}

export function planFromPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRICE_PRO) return "PRO";
  if (priceId === process.env.STRIPE_PRICE_UNLIMITED) return "UNLIMITED";
  return "FREE";
}

export function resolvePlan(
  sub: { status: string; plan: Plan; currentPeriodEnd: Date } | null,
): Plan {
  if (sub && sub.status === "active" && sub.currentPeriodEnd > new Date()) {
    return sub.plan;
  }
  return "FREE";
}

export function currentMonthStart(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
