import { Instrument_Serif } from "next/font/google";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/constants/site";
import { SLATECAMP_PAPER, SLATECAMP_INK } from "@/lib/constants";

const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata = { title: `About — ${siteConfig.name}` };

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: SLATECAMP_PAPER.DEFAULT }}>
      <MarketingNav activeRoute="/about" />
      <main className="flex flex-col items-center justify-center px-6 pt-40 pb-24">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-tight" style={{ color: SLATECAMP_INK.main }}>
          About
        </h1>
        <p className={`${serif.className} mt-4 text-[20px] italic`} style={{ color: SLATECAMP_INK.subtle }}>
          Coming Soon
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
