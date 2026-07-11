import { SiteHeader } from "@/components/site-header";
import { DemoBanner } from "@/components/demo-banner";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DemoBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}
