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

export const metadata = { title: `Contact — ${siteConfig.name}` };

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <MarketingNav activeRoute="/contact" />
      <main className="flex flex-col items-center justify-center px-6 pt-40 pb-24">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-tight text-text-primary">
          Contact
        </h1>
        <p
          className={`${serif.className} mt-4 text-[20px] italic text-text-tertiary`}
        >
          Coming Soon
        </p>
      </main>
      <MarketingFooter />
    </div>
  );
}
