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
import { ROUTES } from "@/lib/routes";

export const metadata = { title: `About — ${siteConfig.name}` };

const TECH_PILLARS = [
  {
    icon: Brain,
    title: "Mapped topic checks",
    body: "Questions help surface which architecture topics feel stable and which ones need another pass. The score is a study signal, not an exam-result forecast.",
  },
  {
    icon: ChartLineUp,
    title: "Calmer next steps",
    body: "SlateCamp points you back to the guides, visuals, and practice areas that match the gap you just found, so study time has a clearer direction.",
  },
  {
    icon: Buildings,
    title: "Architecture-first context",
    body: "Resources, quizzes, 3D visuals, and tools are organized around school, board-season, and early-practice realities, with source boundaries kept visible.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-muted">
      <MarketingNav activeRoute={ROUTES.about} />

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto max-w-[1200px] px-6 pt-36 pb-20 sm:pt-44">
          <div className="max-w-[720px]">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-primary">
              About SlateCamp
            </p>
            <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.1] text-foreground">
              Built by an architect,
              <br />
              for architects.
            </h1>
            <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-text-secondary">
              SlateCamp is a solo project. I&apos;m Philip — a licensed
              architect who took the LEA and lived through the frustration of
              notes and questions that couldn&apos;t show me what connected or
              what to repair next. So I built the atlas I wished had existed.
            </p>
          </div>
        </section>

        {/* ── Philip's Story ── */}
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-[1200px] px-6 py-20">
            <div className="grid gap-12 sm:grid-cols-2 sm:gap-20">
              <div>
                <h2 className="text-[22px] font-semibold text-foreground">
                  The LEA struggle is real
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                  The Licensure Examination for Architects (LEA) covers a wide taxonomy
                  — from the National Building Code to Architectural Theory,
                  Professional Practice to Specifications. Most reviewers treat
                  every topic the same. You end up spending hours on subjects
                  you already know while your actual gaps go unaddressed.
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                  I built SlateCamp because every Filipino architect deserves a
                  calmer architecture knowledge map — one that helps connect
                  sources, visuals, questions, tools, and the next useful step.
                </p>
              </div>
              <div>
                <h2 className="text-[22px] font-semibold text-foreground">
                  The mission
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                  SlateCamp exists because every Filipino architect deserves a
                  knowledge atlas they can actually use. Not a PDF dump. Not a
                  pile of disconnected notes. A source-backed field guide that
                  helps you look up what matters, check what stuck, and decide
                  what to repair next.
                </p>
                <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
                  The platform is built with the same discipline we apply to
                  architecture: every feature should help make scattered
                  knowledge clearer, more visual, and easier to return to.
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
          <h2 className="max-w-[520px] text-[clamp(1.5rem,3vw,2rem)] font-semibold text-foreground">
            Why it feels different
          </h2>
          <p className="mt-4 max-w-[560px] text-[15px] leading-relaxed text-text-secondary">
            SlateCamp is designed around student reassurance: map the topic,
            see the idea, check what stayed, then return to the next useful step.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {TECH_PILLARS.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-md border border-border bg-card p-6 transition-shadow duration-150 hover:shadow-sm"
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
        <section className="border-t border-border bg-primary">
          <div className="mx-auto max-w-[1200px] px-6 py-20 text-center">
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-white">
              Ready to make the next study step clearer?
            </h2>
            <p className="mx-auto mt-4 max-w-[440px] text-[15px] leading-relaxed text-white/70">
              Start with a free check and use the atlas to turn uncertainty
              into a calmer review plan.
            </p>
            <Link
              href={ROUTES.try}
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-card px-6 py-3 text-[14px] font-medium text-primary transition-colors duration-150 hover:bg-card/90"
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
