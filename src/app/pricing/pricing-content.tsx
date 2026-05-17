'use client'

import { useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { trackEvent } from '@/lib/analytics'
import { PricingCard } from '@/components/marketing/PricingCard'
import {
  CORPORATE_TIERS,
  INSTITUTIONAL_TIERS,
  PROFESSIONAL_ANNUAL_TIERS,
  PROFESSIONAL_TIERS,
  STUDENT_GRADUATE_ANNUAL_TIERS,
  STUDENT_GRADUATE_TIERS,
} from '@/lib/constants/pricing'

const TABS = [
  { value: 'students-graduates', label: 'Students/Graduate' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'corporate', label: 'Corporate' },
] as const

const BILLING_TABS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annually' },
] as const

const TAB_DETAILS = {
  'students-graduates': {
    eyebrow: 'LEA review access',
    description:
      'For architecture students, graduates, and board exam takers who need notes, code explainers, quizzes, 3D visuals, and clearer next steps.',
    monthlyTiers: STUDENT_GRADUATE_TIERS,
    annualTiers: STUDENT_GRADUATE_ANNUAL_TIERS,
    monthlyNote: 'Pay month to month while you find your review rhythm.',
    annualNote: 'Pay yearly for a longer board-season camp and lower effective cost.',
    gridClass: 'grid-cols-1 gap-5 lg:grid-cols-3',
  },
  professionals: {
    eyebrow: 'Practice reference',
    description:
      'For licensed architects, apprentices, and small studios using SlateCamp as a field guide for code, specification, and spatial review.',
    monthlyTiers: PROFESSIONAL_TIERS,
    annualTiers: PROFESSIONAL_ANNUAL_TIERS,
    monthlyNote: 'Keep SlateCamp available as a monthly professional field guide.',
    annualNote: 'Use the Field Atlas year-round and save compared with monthly access.',
    gridClass: 'mx-auto max-w-[700px] grid-cols-1 gap-5',
  },
  institutional: {
    eyebrow: 'School and cohort licenses',
    description:
      'For schools, review groups, and academic partners that want organized cohort access, instructor visibility, and structured onboarding.',
    monthlyTiers: INSTITUTIONAL_TIERS,
    gridClass: 'mx-auto max-w-[1120px] grid-cols-1 gap-5 md:grid-cols-2',
  },
  corporate: {
    eyebrow: 'Partner seats with scholarship access',
    description:
      'Corporate seats help teams use SlateCamp while funding access for partner schools, students, and board exam takers who apply for scholarship access.',
    monthlyTiers: CORPORATE_TIERS,
    gridClass: 'mx-auto max-w-[1120px] grid-cols-1 gap-5',
  },
} as const

export const PricingContent = () => {
  useEffect(() => { trackEvent({ event_name: 'upgrade_page_viewed' }) }, [])

  return (
    <div className="mx-auto w-full max-w-[1480px] [@media(max-height:760px)]:origin-top [@media(max-height:760px)]:scale-[0.62]">
      <div className="text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          SlateCamp access plans
        </span>
        <h1
          className="mt-1.5 text-[clamp(1.75rem,2.8vw,2.4rem)] font-semibold text-foreground"
        >
          Pricing for learners, schools, and partners
        </h1>
        <p
          className='font-instrument-serif mx-auto mt-1.5 max-w-3xl text-[16px] italic leading-snug text-muted-foreground'
        >
          Choose the SlateCamp access path that fits the way you study, teach, practice, or support future architects.
        </p>
      </div>

      <Tabs defaultValue="students-graduates" className="mt-5">
        <div className="flex justify-center">
          <TabsList
            variant="line"
            className="h-auto flex-wrap justify-center gap-x-8 gap-y-1 border-b border-border pb-px"
          >
            {TABS.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="px-1 pb-2 text-[14px] text-muted-foreground data-[state=active]:text-foreground"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS.map(({ value }) => {
          const detail = TAB_DETAILS[value]
          const hasBillingTabs = 'annualTiers' in detail

          return (
            <TabsContent key={value} value={value}>
              {value === 'corporate' && (
                <div className="mx-auto mt-2 mb-3 max-w-[1120px] rounded-2xl border border-primary/20 bg-primary/[0.04] p-3 text-left shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    1 paid seat = 1 scholarship seat
                  </p>
                  <p className="mt-2 text-[14px] leading-relaxed text-foreground/80">
                    Every corporate seat purchased funds one scholarship seat for
                    partner-school learners and qualified students or board exam
                    takers who apply for access to all SlateCamp features.
                  </p>
                </div>
              )}

              {hasBillingTabs ? (
                <Tabs defaultValue="monthly" className="mt-4 space-y-3">
                  <div className="flex flex-col items-center gap-2">
                    <TabsList
                      variant="line"
                      className="h-auto justify-center gap-7 border-b border-border bg-transparent pb-px"
                    >
                      {BILLING_TABS.map(({ value: billingValue, label }) => (
                        <TabsTrigger
                          key={billingValue}
                          value={billingValue}
                          className="px-1 pb-2 text-[13px] text-muted-foreground data-[state=active]:text-primary"
                        >
                          {label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <TabsContent value="monthly">
                    <div className={`grid ${detail.gridClass}`}>
                      {detail.monthlyTiers.map((tier) => (
                        <PricingCard key={tier.id} tier={tier} />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="annual">
                    <div className={`grid ${detail.gridClass}`}>
                      {detail.annualTiers.map((tier) => (
                        <PricingCard key={tier.id} tier={tier} />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className={`grid ${detail.gridClass}`}>
                  {detail.monthlyTiers.map((tier) => (
                    <PricingCard key={tier.id} tier={tier} />
                  ))}
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
