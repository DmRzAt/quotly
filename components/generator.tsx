"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const PaletteScene = dynamic(
  () => import("@/components/palette-scene").then((m) => m.PaletteScene),
  { ssr: false },
);

type GeneratorProps = {
  initialUsed: number;
  limit: number | null;
  plan: string;
};

export function Generator({ initialUsed, limit, plan }: GeneratorProps) {
  const [input, setInput] = useState("");
  const [palette, setPalette] = useState<string[] | null>(null);
  const [used, setUsed] = useState(initialUsed);
  const [quotaExceeded, setQuotaExceeded] = useState(
    limit !== null && initialUsed >= limit,
  );
  const [loading, setLoading] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  async function requestPalette(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    setLoading(false);

    if (res.status === 402) {
      setQuotaExceeded(true);
      return;
    }
    if (!res.ok) return;

    const data = await res.json();
    setPalette(data.output);
    setUsed(data.used);
    if (data.limit !== null && data.used >= data.limit) setQuotaExceeded(true);
  }

  async function copyHexToClipboard(hex: string) {
    await navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1200);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">
            {used}
            {limit !== null ? `/${limit}` : ""} used this month
          </span>
          <span className="font-medium">{plan}</span>
        </div>
        {limit !== null && (
          <Progress value={Math.min((used / limit) * 100, 100)} />
        )}
      </div>

      {quotaExceeded && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Monthly quota reached</p>
              <p className="text-sm text-muted-foreground">
                Upgrade to keep generating palettes.
              </p>
            </div>
            <Button render={<Link href="/pricing" />}>Upgrade</Button>
          </CardContent>
        </Card>
      )}

      <form onSubmit={requestPalette} className="flex gap-2">
        <Input
          placeholder="Type anything — e.g. “ocean sunset”"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={200}
          required
          disabled={quotaExceeded}
        />
        <Button type="submit" disabled={loading || quotaExceeded}>
          {loading ? "Generating…" : "Generate"}
        </Button>
      </form>

      {palette && (
        <>
          <PaletteScene colors={palette} />
          <div className="grid grid-cols-5 overflow-hidden rounded-xl border">
            {palette.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => copyHexToClipboard(hex)}
                className="group flex h-24 items-end justify-center pb-3 transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: hex }}
                title="Click to copy"
              >
                <span className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {copiedHex === hex ? "Copied!" : hex}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
