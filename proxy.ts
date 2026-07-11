import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16's proxy (formerly middleware): refreshes the Supabase session
// and redirects signed-out visitors away from app routes.
export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/dashboard/:path*", "/billing/:path*"],
};
