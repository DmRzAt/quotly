"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UpgradeButton({
  plan,
  label,
  variant = "default",
}: {
  plan: "PRO" | "UNLIMITED";
  label: string;
  variant?: "default" | "outline";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function checkout() {
    setLoading(true);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });

    if (res.status === 401) {
      router.push("/?signin=1");
      return;
    }

    const data = await res.json().catch(() => null);
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <Button onClick={checkout} disabled={loading} variant={variant} className="w-full">
      {loading ? "Redirecting…" : label}
    </Button>
  );
}
