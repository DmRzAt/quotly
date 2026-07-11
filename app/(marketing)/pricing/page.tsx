import Link from "next/link";
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
import { UpgradeButton } from "@/components/upgrade-button";

const tiers = [
  {
    name: "Free",
    price: "$0",
    features: ["5 palettes / month", "Deterministic generation", "No card required"],
  },
  {
    name: "Pro",
    price: "$9",
    plan: "PRO" as const,
    highlight: true,
    features: ["100 palettes / month", "Everything in Free", "Cancel anytime"],
  },
  {
    name: "Unlimited",
    price: "$29",
    plan: "UNLIMITED" as const,
    features: ["Unlimited palettes", "Everything in Pro", "Cancel anytime"],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Stripe test mode — pay with{" "}
          <code className="font-mono">4242 4242 4242 4242</code>, no real
          charges.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card
            key={tier.name}
            className={tier.highlight ? "border-primary shadow-md" : ""}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{tier.name}</CardTitle>
                {tier.highlight && <Badge>Popular</Badge>}
              </div>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  {tier.price}
                </span>
                <span className="text-muted-foreground"> /month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-2 text-sm">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-primary">✓</span> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {tier.plan ? (
                <UpgradeButton
                  plan={tier.plan}
                  label={`Get ${tier.name}`}
                  variant={tier.highlight ? "default" : "outline"}
                />
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  render={<Link href="/dashboard" />}
                >
                  Get started
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
