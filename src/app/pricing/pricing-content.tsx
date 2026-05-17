'use client'

import { useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { trackEvent } from '@/lib/analytics'
import { PricingCard } from '@/components/marketing/PricingCard'
import {
  CORPORATE_TIERS,
  INSTITUTIONAL_TIERS,
  PROFESSIONAL_TIERS,
  STUDENT_GRADUATE_TIERS,
} from '@/lib/constants/pricing'

const TABS = [
  { value: 'students-graduates', label: 'Students/Graduate' },
  { value: 'professionals', label: 'Professionals' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'corporate', label: 'Corporate' },
] as const

const TAB_DETAILS = {
  'students-graduates': {
    eyebrow: 'LEA review access',
    description:
      'For architecture students, graduates, and board exam takers who need notes, code explainers, quizzes, 3D visuals, and clearer next steps.',
    tiers: STUDENT_GRADUATE_TIERS,
    gridClass: 'grid-cols-1 gap-6 lg:grid-cols-3',
  },
  professionals: {
    eyebrow: 'Practice reference',
    description:
      'For licensed architects, apprentices, and small studios using SlateCamp as a field guide for code, specification, and spatial review.',
    tiers: PROFESSIONAL_TIERS,
    gridClass: 'mx-auto max-w-[520px] grid-cols-1 gap-6',
  },
  institutional: {
    eyebrow: 'School and cohort licenses',
    description:
      'For schools, review groups, and academic partners that want organized cohort access, instructor visibility, and structured onboarding.',
    tiers: INSTITUTIONAL_TIERS,
    gridClass: 'mx-auto max-w-[860px] grid-cols-1 gap-6 md:grid-cols-2',
  },
  corporate: {
    eyebrow: 'Partner seats with scholarship access',
    description:
      'Corporate seats help teams use SlateCamp while funding access for partner schools, students, and board exam takers who apply for scholarship access.',
    tiers: CORPORATE_TIERS,
    gridClass: 'mx-auto max-w-[720px] grid-cols-1 gap-6',
  },
} as const

export const PricingContent = () => {
  useEffect(() => { trackEvent({ event_name: 'upgrade_page_viewed' }) }, [])

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
          SlateCamp access plans
        </span>
        <h1
          className="mt-3 text-[clamp(2rem,5vw,3.5rem)] font-semibold text-foreground"
        >
          Pricing for learners, schools, and partners
        </h1>
        <p
          className='font-instrument-serif mx-auto mt-4 max-w-2xl text-[20px] italic leading-snug text-muted-foreground'
        >
          Choose the SlateCamp access path that fits the way you study, teach, practice, or support future architects.
        </p>
      </div>

      <Tabs defaultValue="students-graduates" className="mt-14">
        <div className="flex justify-center">
          <TabsList
            variant="line"
            className="h-auto flex-wrap justify-center gap-x-6 gap-y-2 border-b border-border pb-px"
          >
            {TABS.map(({ value, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="px-1 pb-3 text-[14px] text-muted-foreground data-[state=active]:text-foreground"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TABS.map(({ value }) => {
          const detail = TAB_DETAILS[value]

          return (
            <TabsContent key={value} value={value}>
              <div className="mt-5 mb-8 text-center">
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
                  {detail.eyebrow}
                </p>
                <p className="mx-auto mt-2 max-w-2xl text-[13px] leading-relaxed text-muted-foreground">
                  {detail.description}
                </p>
              </div>
              {value === 'corporate' && (
                <div className="mx-auto mb-6 max-w-[720px] rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 text-left shadow-sm">
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
              <div className={`grid ${detail.gridClass}`}>
                {detail.tiers.map((tier) => (
                  <PricingCard key={tier.id} tier={tier} />
                ))}
              </div>
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
