"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function AuthButtons() {
  const [email, setEmail] = useState("");
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setLinkSent(true);
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button onClick={signInWithGoogle} className="flex-1">
          Sign in with Google
        </Button>
        <form method="post" action="/api/demo-login" className="flex-1">
          <input type="hidden" name="role" value="buyer" />
          <Button type="submit" variant="secondary" className="w-full">
            Try as buyer
          </Button>
        </form>
        <form method="post" action="/api/demo-login" className="flex-1">
          <input type="hidden" name="role" value="seller" />
          <Button type="submit" variant="secondary" className="w-full">
            Try as seller
          </Button>
        </form>
      </div>

      {linkSent ? (
        <p className="text-sm text-muted-foreground">
          Check your inbox — we sent you a magic link.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="flex gap-2">
          <Input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" variant="outline">
            Magic link
          </Button>
        </form>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
