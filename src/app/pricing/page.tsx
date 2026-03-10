import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { PricingContent } from "./pricing-content";
import { siteConfig } from "@/lib/constants/site";

export const metadata = { title: `Pricing — ${siteConfig.name}` };

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#F5F4F0]">
      <MarketingNav activeRoute="/pricing" />
      <main className="px-6 pt-32 pb-24 sm:pt-40">
        <PricingContent />
      </main>
      <MarketingFooter />
    </div>
  );
}
