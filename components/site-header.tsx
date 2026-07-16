import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { createClient } from "@/lib/supabase/server";

const authedLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/seller", label: "Sell" },
  { href: "/purchases", label: "Purchases" },
  { href: "/billing", label: "Billing" },
];

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
          {user ? (
            <>
              {authedLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  size="sm"
                  render={<Link href={link.href} />}
                >
                  {link.label}
                </Button>
              ))}
              <SignOutButton />
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/marketplace" />}
              >
                Marketplace
              </Button>
              <Button
                variant="ghost"
                size="sm"
                render={<Link href="/pricing" />}
              >
                Pricing
              </Button>
              <Button size="sm" render={<Link href="/#signin" />}>
                Sign in
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
