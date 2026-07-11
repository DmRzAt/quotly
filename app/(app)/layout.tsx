import { SiteHeader } from "@/components/site-header";
import { DemoBanner } from "@/components/demo-banner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DemoBanner />
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10">{children}</div>
      </main>
    </>
  );
}
