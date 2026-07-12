"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ManageBillingButton() {
  const [loading, setLoading] = useState(false);

  async function openBillingPortal() {
    setLoading(true);
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json().catch(() => null);
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setLoading(false);
    }
  }

  return (
    <Button onClick={openBillingPortal} disabled={loading}>
      {loading ? "Opening…" : "Manage subscription"}
    </Button>
  );
}
