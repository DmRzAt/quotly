import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
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

  return NextResponse.redirect(new URL("/dashboard", req.url), 303);
}
