"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SellerOnboardButton({ label }: { label: string }) {
  const [loading, setLoading] = useState(false);

  async function startOnboarding() {
    setLoading(true);
    const res = await fetch("/api/connect/onboard", { method: "POST" });
    const data = await res.json().catch(() => null);
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <Button onClick={startOnboarding} disabled={loading}>
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
