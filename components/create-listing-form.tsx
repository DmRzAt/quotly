"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CreateListingForm() {
  const [title, setTitle] = useState("");
  const [phrase, setPhrase] = useState("");
  const [price, setPrice] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submitListing(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const priceCents = Math.round(Number(price) * 100);
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, phrase, priceCents }),
    });

    setLoading(false);
    if (res.ok) {
      setTitle("");
      setPhrase("");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New listing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submitListing} className="flex flex-col gap-3">
          <Input
            placeholder="Title — e.g. “Sunset brand kit”"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            required
          />
          <Input
            placeholder="Palette phrase — e.g. “golden hour beach”"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            maxLength={200}
            required
          />
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="1000"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-28"
              required
            />
            <span className="self-center text-sm text-muted-foreground">
              USD
            </span>
            <Button type="submit" disabled={loading} className="ml-auto">
              {loading ? "Creating…" : "Create listing"}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
