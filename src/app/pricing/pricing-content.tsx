'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Instrument_Serif } from 'next/font/google'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { trackEvent } from '@/lib/analytics'
import { PricingCard } from '@/components/marketing/PricingCard'
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { ROUTES } from '@/lib/routes'
import {
  INDIVIDUAL_TIERS,
  EDUCATIONAL_TIERS,
  ENTERPRISE_TIERS,
} from '@/lib/constants/pricing'

const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const TABS = [
  { value: 'individuals', label: 'For Individuals' },
  { value: 'educational', label: 'For Students & Teachers' },
  { value: 'enterprise', label: 'For Organizations' },
] as const

export const PricingContent = () => {
  useEffect(() => { trackEvent({ event_name: 'upgrade_page_viewed' }) }, [])

  if (!FEATURE_PAYMENTS_ENABLED) {
    return (
      <div className="mx-auto max-w-[1200px] text-center py-20">
        <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-foreground">
          Free Access
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
          All features are currently available for free. Start studying now.
        </p>
        <Button asChild className="mt-8">
          <Link href={ROUTES.dashboard.root}>Go to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="text-center">
        <h1
          className="text-[clamp(2rem,5vw,3.5rem)] font-semibold text-foreground"
        >
          Simple, transparent pricing
        </h1>
        <p
          className={`${serif.className} mx-auto mt-4 max-w-md text-[20px] italic leading-snug text-muted-foreground`}
        >
          Choose the plan that fits your goals.
        </p>
      </div>

      <Tabs defaultValue="individuals" className="mt-14">
        <div className="flex justify-center">
          <TabsList
            variant="line"
            className="h-auto gap-6 border-b border-border pb-px"
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

        <TabsContent value="individuals">
          <div className="mt-3 mb-8 text-center">
            <p className="text-[13px] text-muted-foreground">
              For architecture students and active LEA reviewees.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {INDIVIDUAL_TIERS.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>
        </TabsContent>

        {/* VIEW 2 — Educational */}
        <TabsContent value="educational">
          <div className="mt-3 mb-8 text-center">
            <p className="text-[13px] text-muted-foreground">
              For universities and review centers. Volume pricing, instructor
              dashboards, and custom content tools.
            </p>
          </div>
          <div className="mx-auto grid max-w-[800px] grid-cols-1 gap-6 sm:grid-cols-2">
            {EDUCATIONAL_TIERS.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>
        </TabsContent>

        {/* VIEW 3 — Enterprise */}
        <TabsContent value="enterprise">
          <div className="mt-3 mb-8 text-center">
            <p className="text-[13px] text-muted-foreground">
              For material suppliers and architectural firms looking to reach
              the next generation of licensed architects.
            </p>
          </div>
          <div className="mx-auto grid max-w-[800px] grid-cols-1 gap-6 sm:grid-cols-2">
            {ENTERPRISE_TIERS.map((tier) => (
              <PricingCard key={tier.id} tier={tier} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
