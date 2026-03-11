import Link from "next/link";
import { Instrument_Serif } from "next/font/google";
import { ROUTES } from "@/lib/constants/routes";
import { siteConfig } from "@/lib/constants/site";

const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const FOOTER_LINKS = [
  { href: ROUTES.PRICING, label: "Pricing" },
  { href: ROUTES.ABOUT, label: "About" },
  { href: ROUTES.CONTACT, label: "Contact" },
] as const;

export function MarketingFooter({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isDark = variant === 'dark'
  return (
    <footer className={`border-t ${isDark ? 'border-white/[0.06]' : 'border-[#1D1D1F]/[0.06]'}`}>
      <div className="mx-auto max-w-[1200px] px-6 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <span className={`text-[12px] ${isDark ? 'text-white/30' : 'text-[#AEAEB2]'}`}>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </span>
          <nav className="flex items-center gap-1">
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-3 py-3 text-[12px] transition-colors duration-150 ${
                  isDark ? 'text-white/30 hover:text-white/60' : 'text-[#AEAEB2] hover:text-[#6E6E73]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <span
            className={`${serif.className} text-[12px] italic tracking-wide ${isDark ? 'text-white/30' : 'text-[#AEAEB2]'}`}
          >
            Less, but better.
          </span>
        </div>
      </div>
    </footer>
  );
}
