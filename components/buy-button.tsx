"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BuyButton({
  listingId,
  label,
}: {
  listingId: string;
  label: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function startPurchase() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });

    if (res.status === 401) {
      router.push("/?signin=1");
      return;
    }

    const data = await res.json().catch(() => null);
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setError(data?.error ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={startPurchase} disabled={loading} size="sm">
        {loading ? "Redirecting…" : label}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
