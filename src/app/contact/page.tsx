import {
  EnvelopeSimple,
  InstagramLogo,
  TwitterLogo,
  LinkedinLogo,
  Clock,
  Question,
} from "@phosphor-icons/react/dist/ssr";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { siteConfig } from "@/lib/constants/site";

export const metadata = { title: `Contact — ${siteConfig.name}` };

const FAQS = [
  {
    q: "Is SlateCamp only for the Philippine Architecture Licensure Exam?",
    a: "Yes — for now. The platform is purpose-built for the ALE. The question bank, taxonomy, and Readiness Score are all calibrated to the official syllabus. Support for other disciplines may follow.",
  },
  {
    q: "How is the Readiness Score calculated?",
    a: "The score uses a 2-parameter Item Response Theory (IRT) model — the same approach used in high-stakes licensure exams. It accounts for question difficulty and your pattern of correct and incorrect answers, not just a raw percentage.",
  },
  {
    q: "Can I use SlateCamp for free?",
    a: "Yes. The diagnostic and a core set of practice questions are free with no account required. A paid plan unlocks the full question bank, spaced repetition scheduling, and detailed analytics.",
  },
  {
    q: "How often is the question bank updated?",
    a: "The bank is reviewed and updated continuously. Every question is expert-verified before it enters the live pool. If you spot an error, use the in-session flag tool and we review it within 48 hours.",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <MarketingNav activeRoute="/contact" />

      <main>
        {/* ── Hero ── */}
        <section className="mx-auto max-w-[1200px] px-6 pt-36 pb-20 sm:pt-44">
          <div className="max-w-[600px]">
            <p className="mb-4 text-[13px] font-medium uppercase tracking-widest text-primary">
              Contact
            </p>
            <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
              We&apos;re here to help.
            </h1>
            <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-text-secondary">
              SlateCamp is a small team. When you reach out, you&apos;re talking
              directly to the people who built the platform.
            </p>
          </div>
        </section>

        {/* ── Contact Cards ── */}
        <section className="border-t border-zinc-200 bg-white">
          <div className="mx-auto max-w-[1200px] px-6 py-16">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Email */}
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-8">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-primary-50 text-primary">
                  <EnvelopeSimple size={20} weight="duotone" />
                </div>
                <h2 className="text-[16px] font-semibold text-foreground">
                  Email support
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  For questions about your account, the question bank, or
                  anything else — email us directly.
                </p>
                <a
                  href="mailto:support@slatecamp.com"
                  className="mt-4 inline-block text-[14px] font-medium text-primary transition-colors duration-150 hover:text-[#1535A8]"
                >
                  support@slatecamp.com
                </a>
              </div>

              {/* Response time */}
              <div className="rounded-md border border-zinc-200 bg-zinc-50 p-8">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-primary-50 text-primary">
                  <Clock size={20} weight="duotone" />
                </div>
                <h2 className="text-[16px] font-semibold text-foreground">
                  Response time
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  We respond to every message within 24 hours on weekdays.
                  Urgent issues affecting your active study session are
                  prioritised.
                </p>
                <p className="mt-4 text-[13px] font-medium text-[#2D9F6F]">
                  Usually within 24 hours
                </p>
              </div>
            </div>

            {/* Social links */}
            <div className="mt-10">
              <p className="mb-4 text-[13px] font-medium text-[#8896A7]">
                Follow along
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://instagram.com/slatecamp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SlateCamp on Instagram"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-zinc-200 bg-white text-text-secondary transition-colors duration-150 hover:border-zinc-300 hover:text-foreground"
                >
                  <InstagramLogo size={18} />
                </a>
                <a
                  href="https://twitter.com/slatecamp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SlateCamp on X / Twitter"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-zinc-200 bg-white text-text-secondary transition-colors duration-150 hover:border-zinc-300 hover:text-foreground"
                >
                  <TwitterLogo size={18} />
                </a>
                <a
                  href="https://linkedin.com/company/slatecamp"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SlateCamp on LinkedIn"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-zinc-200 bg-white text-text-secondary transition-colors duration-150 hover:border-zinc-300 hover:text-foreground"
                >
                  <LinkedinLogo size={18} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mx-auto max-w-[1200px] px-6 py-20">
          <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-sm bg-primary-50 text-primary">
            <Question size={20} weight="duotone" />
          </div>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-foreground">
            Frequently asked questions
          </h2>
          <p className="mt-3 max-w-[480px] text-[15px] leading-relaxed text-text-secondary">
            Quick answers to the questions we hear most often.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-md border border-zinc-200 bg-white p-6 transition-shadow duration-150 hover:shadow-sm"
              >
                <p className="text-[14px] font-semibold text-foreground">{q}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-text-secondary">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
