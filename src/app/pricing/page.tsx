import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { FaqSection } from "@/components/marketing/FaqSection";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";
import { PricingContent } from "./pricing-content";
import { siteConfig } from "@/lib/constants/site";

export const metadata = { title: `Pricing — ${siteConfig.name}` };

const PRICING_FAQS = [
  { question: "Can I use SlateCamp for free?", answer: "Yes. The diagnostic and a core set of practice questions are free with no account required. A paid plan unlocks the full question bank, spaced repetition scheduling, and detailed analytics." },
  { question: "What payment methods do you accept?", answer: "We accept major credit/debit cards, GCash, Maya, and bank transfers via our payment partners. All transactions are processed securely." },
  { question: "Can I cancel anytime?", answer: "Yes. You can cancel your subscription at any time from your dashboard settings. Your access continues until the end of your billing period." },
  { question: "Is there a student discount?", answer: "Yes. Architecture students can get discounted access through our Students & Teachers plan. Verify your student status during sign-up." },
  { question: "What happens when my subscription ends?", answer: "You keep access to your study history and readiness scores. Practice questions revert to the free tier. You can resubscribe anytime to regain full access." },
  { question: "Do you offer team or school pricing?", answer: "Yes. Our Organizations plan includes bulk licensing, admin dashboards, and progress tracking across your team. Contact us for custom pricing." },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-muted">
      <MarketingNav activeRoute="/pricing" />
      <main>
        <div className="px-6 pt-32 pb-24 sm:pt-40">
          <PricingContent />
        </div>
        <FaqSection
          heading="Pricing FAQ"
          subheading="Common questions about plans, billing, and access."
          questions={PRICING_FAQS}
          className="mx-auto max-w-[1200px] px-6 pb-20"
        />
        <FinalCtaSection
          ctaHref="/try"
          ctaLabel="Get Your Free Readiness Score"
          isLoggedIn={false}
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
