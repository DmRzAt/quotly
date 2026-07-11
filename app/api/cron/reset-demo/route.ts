import { prisma } from "@/lib/prisma";

/**
 * Daily Vercel cron (vercel.json): wipes the demo account's generations
 * so its quota never fills up.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const email = process.env.DEMO_EMAIL;
  if (!email) return Response.json({ skipped: "DEMO_EMAIL not set" });

  const demoUser = await prisma.user.findUnique({ where: { email } });
  if (!demoUser) return Response.json({ skipped: "demo user not found" });

  const { count } = await prisma.generation.deleteMany({
    where: { userId: demoUser.id },
  });

  return Response.json({ deleted: count });
}
