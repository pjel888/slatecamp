import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { FaqSection } from '@/components/marketing/FaqSection'
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection'
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { siteConfig } from '@/lib/constants/site'
import { ROUTES } from '@/lib/routes'
import { PricingContent } from './pricing-content'

export const metadata = { title: `Pricing — ${siteConfig.name}` }

const PRICING_FAQS = FEATURE_PAYMENTS_ENABLED
  ? [
      {
        question: 'Can I use SlateCamp for free?',
        answer:
          'Yes. Free access stays available for the diagnostic and starter study surfaces, while paid checkout only appears on supported plans.',
      },
      {
        question: 'Which paid plans are currently supported?',
        answer:
          'Only the plans shown in the live checkout flow are currently supported. If you need school, cohort, team, or partner access, contact SlateCamp first.',
      },
      {
        question: 'How do I manage billing?',
        answer:
          'Billing controls only appear when payments are enabled for your build and plan. If you do not see billing controls, your account is currently on the free path.',
      },
      {
        question: 'Do you offer school or team pricing?',
        answer:
          'Not as a public self-serve plan today. Institutional conversations are handled manually through contact.',
      },
    ]
  : [
      {
        question: 'Can I use SlateCamp for free?',
        answer:
          'Yes. Currently available starter surfaces are free while billing is disabled.',
      },
      {
        question: 'Is paid checkout live right now?',
        answer:
          'Not in this build. Public payment checkout is disabled for now, so SlateCamp will not ask you for card or e-wallet details here.',
      },
      {
        question: 'Can I cancel a plan today?',
        answer:
          'There is no active self-serve subscription flow in the current build, so there is nothing to cancel from the pricing page right now.',
      },
      {
        question: 'Do you offer school or team pricing?',
        answer:
          'Not as a public self-serve plan today. If you are exploring school, cohort, or team use, contact SlateCamp first.',
      },
    ]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-muted">
      <MarketingNav activeRoute={ROUTES.pricing} />
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
          ctaHref={ROUTES.try}
          ctaLabel="Start free"
          isLoggedIn={false}
        />
      </main>
      <MarketingFooter />
    </div>
  )
}
