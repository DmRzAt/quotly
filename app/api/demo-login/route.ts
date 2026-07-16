import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const role = form?.get("role") === "seller" ? "seller" : "buyer";

  const email =
    role === "seller" ? process.env.DEMO_SELLER_EMAIL : process.env.DEMO_EMAIL;
  const password =
    role === "seller"
      ? process.env.DEMO_SELLER_PASSWORD
      : process.env.DEMO_PASSWORD;

  if (!email || !password) {
    return NextResponse.redirect(new URL("/?demo=unavailable", req.url), 303);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.redirect(new URL("/?demo=error", req.url), 303);
  }

  const destination = role === "seller" ? "/seller" : "/dashboard";
  return NextResponse.redirect(new URL(destination, req.url), 303);
}
