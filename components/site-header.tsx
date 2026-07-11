import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Quotly
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" render={<Link href="/pricing" />}>
            Pricing
          </Button>
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/dashboard" />}
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/billing" />}
              >
                Billing
              </Button>
              <span className="hidden px-2 text-sm text-muted-foreground sm:inline">
                {user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <Button size="sm" render={<Link href="/#signin" />}>
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
