import Link from "next/link";
import {
  Buildings,
  Brain,
  ChartLineUp,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/constants/site";

export const metadata = { title: `About — ${siteConfig.name}` };

const TECH_PILLARS = [
  {
    icon: Brain,
    title: "IRT Adaptive Testing",
    body: "Every question you answer recalibrates the difficulty of what comes next. The engine uses a 2-parameter logistic model — the same method used in high-stakes licensure exams — so your Readiness Score reflects true mastery, not luck.",
  },
  {
    icon: ChartLineUp,
    title: "Spaced Repetition (SRS)",
    body: "Topics you struggle with surface again at precisely the right interval to cement long-term recall. Topics you've mastered stay out of the way. You never waste a session.",
  },
  {
    icon: Buildings,
    title: "Anti-Inflation Readiness Score",
    body: "Most reviewers inflate your confidence with easy questions. SlateCamp's score is calibrated against actual ALE difficulty. A 75% here means you're genuinely ready for exam day.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <MarketingNav activeRoute="/about" />

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto max-w-[1200px] px-6 pt-36 pb-20 sm:pt-44">
          <div className="max-w-[720px]">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-primary">
              About SlateCamp
            </p>
            <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
              Built by an architect,
              <br />
              for architects.
            </h1>
            <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-text-secondary">
              SlateCamp is a solo project. I&apos;m Philip — a licensed
              architect who took the ALE and lived through the frustration of
              reviewers that couldn&apos;t tell me where I actually stood. So I
              built the tool I wished had existed.
            </p>
          </div>
        </section>

        {/* ── Philip's Story ── */}
        <section className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-20">
            <div className="grid gap-12 sm:grid-cols-2 sm:gap-20">
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
                  The ALE struggle is real
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                  The Architecture Licensure Examination covers a wide taxonomy
                  — from the National Building Code to Architectural Theory,
                  Professional Practice to Specifications. Most reviewers treat
                  every topic the same. You end up spending hours on subjects
                  you already know while your actual gaps go unaddressed.
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                  I built SlateCamp because every Filipino architect deserves a
                  study engine that adapts to them — one that knows the
                  difference between a topic you&apos;ve mastered and one you
                  just got lucky on.
                </p>
              </div>
              <div>
                <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
                  The mission
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                  SlateCamp exists because every Filipino architect deserves a
                  study engine that adapts to them. Not a PDF dump. Not a
                  flashcard deck. A real-time intelligence platform that tells
                  you exactly where you stand, what to study next, and whether
                  you&apos;re ready to sit the exam.
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                  The platform is built with the same discipline we apply to
                  architecture: nothing is decorative. Every feature earns its
                  place by improving your outcome.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Technology ── */}
        <section className="mx-auto max-w-[1200px] px-6 py-20">
          <p className="mb-3 text-[13px] font-medium uppercase tracking-widest text-primary">
            The technology
          </p>
          <h2 className="max-w-[520px] text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-foreground">
            Why it works differently
          </h2>
          <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-text-secondary">
            SlateCamp doesn&apos;t guess at what you need. Three purpose-built
            systems work together to make every study session count.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {TECH_PILLARS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-md border border-zinc-200 bg-white p-6 transition-shadow duration-150 hover:shadow-sm"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-primary-50 text-primary">
                  <Icon size={20} weight="duotone" />
                </div>
                <h3 className="text-[15px] font-semibold text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-zinc-200 bg-primary">
          <div className="mx-auto max-w-[1200px] px-6 py-20 text-center">
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-white">
              Ready to find out where you actually stand?
            </h2>
            <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-relaxed text-white/70">
              Take the free diagnostic. No account required. See your Readiness
              Score across every ALE taxonomy in under 20 minutes.
            </p>
            <Link
              href="/try"
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-white px-6 py-3 text-[14px] font-medium text-primary transition-colors duration-150 hover:bg-white/90"
            >
              Start your diagnostic
              <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
