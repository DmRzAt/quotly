import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ManageBillingButton } from "@/components/manage-billing-button";
import { prisma } from "@/lib/prisma";
import { PLAN_META, resolvePlan } from "@/lib/plans";
import { getAppUser } from "@/lib/user";

export default async function BillingPage() {
  const user = await getAppUser();
  if (!user) redirect("/");

  const sub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  const plan = resolvePlan(sub);
  const meta = PLAN_META[plan];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">Billing</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{meta.name} plan</CardTitle>
            {sub && <Badge variant="outline">{sub.status}</Badge>}
          </div>
          <CardDescription>{meta.blurb}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {plan === "FREE" ? (
            <p>You are on the free plan. Upgrade to raise your monthly quota.</p>
          ) : (
            sub && (
              <p>
                Renews / expires on{" "}
                {sub.currentPeriodEnd.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                .
              </p>
            )
          )}
        </CardContent>
        <CardFooter className="gap-2">
          {user.stripeCustomerId && plan !== "FREE" ? (
            <ManageBillingButton />
          ) : (
            <Button render={<Link href="/pricing" />}>Upgrade</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
