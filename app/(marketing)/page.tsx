import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthButtons } from "@/components/auth-buttons";
import { generatePalette } from "@/lib/generator";

export default function LandingPage() {
  const sample = generatePalette("ocean sunset");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-12 px-4 py-20">
      <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Color palettes, on a budget.
        </h1>
        <p className="text-lg text-muted-foreground">
          Type a phrase, get a 5-color palette. Free plan gives you 5 a month —
          upgrade when you need more. A tiny product wrapped in a real billing
          stack: Supabase auth, Stripe subscriptions, quota enforcement.
        </p>
        <div id="signin" className="flex w-full justify-center">
          <AuthButtons />
        </div>
        <Button
          variant="link"
          className="text-muted-foreground"
          render={<Link href="/pricing" />}
        >
          See pricing →
        </Button>
      </div>

      <div className="w-full max-w-2xl">
        <div className="grid grid-cols-5 overflow-hidden rounded-xl border shadow-sm">
          {sample.map((color) => (
            <div key={color} className="flex h-28 items-end justify-center pb-2" style={{ backgroundColor: color }}>
              <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[10px] text-white">
                {color}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          “ocean sunset” — same input, same palette, every time
        </p>
      </div>

      <div className="grid w-full max-w-3xl gap-6 sm:grid-cols-3">
        {[
          ["Sign in", "Google OAuth or a magic link via Supabase Auth."],
          ["Generate", "Every palette counts against your monthly quota."],
          ["Upgrade", "Stripe Checkout in test mode — card 4242 4242 4242 4242."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-lg border p-4">
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
