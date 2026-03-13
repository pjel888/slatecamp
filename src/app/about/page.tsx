import { Instrument_Serif } from "next/font/google";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/constants/site";

const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata = { title: `About — ${siteConfig.name}` };

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <MarketingNav activeRoute="/about" />
      <main className="flex flex-col items-center justify-center px-6 pt-40 pb-24">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-tight text-zinc-900">
          About
        </h1>
        <p
          className={`${serif.className} mt-4 text-[20px] italic text-zinc-600`}
        >
          Coming Soon
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
