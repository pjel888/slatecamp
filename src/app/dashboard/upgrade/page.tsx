import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics-server'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import { UpgradeButtons } from '@/components/dashboard/upgrade/UpgradeButtons'

/**
 * Paywall Full-Screen — UX Strategy Section 15
 *
 * "Know you'll win."
 * GCash FIRST. "Not yet — continue free" always visible.
 * No dark patterns. No countdown timers. No "limited offer."
 */

const FEATURE_COMPARISON = [
  { feature: 'Daily questions', free: '20/day', pro: 'Unlimited' },
  { feature: 'Difficulty levels', free: 'Easy only', pro: 'All levels' },
  { feature: 'Camp Trails', free: '1 starter trail', pro: 'Full library' },
  { feature: 'Readiness Score', free: 'Once (diagnostic)', pro: 'Live updates' },
  { feature: 'Taxonomy Heatmap', free: 'Blurred', pro: 'Full detail' },
  { feature: 'Focus Review', free: '—', pro: 'Included' },
  { feature: 'Full Exam Simulation', free: '—', pro: 'Included' },
]

const UpgradePage = async () => {
  const { data: { user } } = await getUser()

  if (user) {
    const supabase = await createClient()
    const { data: stats } = await supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user.id)
      .single()

    void trackServerEvent('upgrade_page_viewed', {
      source: 'direct',
      current_score: stats?.global_readiness_score ?? null,
    })
  }

  return (
    <SharedPageLayout>
      <div className="mx-auto w-full max-w-xl px-4 py-8">
        {/* Headline — Boldonse 400, 36px */}
        <h1 className="font-[family-name:var(--font-boldonse)] text-[36px] font-extrabold leading-tight text-foreground">
          Know you&apos;ll win.
        </h1>

        {/* Value statement — Inter 16px */}
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Pro students see their live score, full heatmap, and a Day-by-Day Trail
          built around their gaps.
        </p>

        {/* Feature Comparison Table */}
        <div className="mt-8 overflow-hidden rounded-md border border-border">
          <div className="grid grid-cols-3 bg-foreground px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground" />
            <div className="text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Free
            </div>
            <div className="text-center text-[11px] font-medium uppercase tracking-wider text-white">
              Pro
            </div>
          </div>
          {FEATURE_COMPARISON.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 items-center px-4 py-3 border-t border-border ${
                i % 2 === 0 ? 'bg-white' : 'bg-muted'
              }`}
            >
              <div className="text-sm font-medium text-foreground">{row.feature}</div>
              <div className="text-center text-sm text-muted-foreground">{row.free}</div>
              <div className="text-center text-sm font-medium text-foreground">{row.pro}</div>
            </div>
          ))}
        </div>

        {/* Social Proof — Campfire (UX Strategy Section 15) */}
        <div className="mt-8 rounded-md border border-border bg-white p-4">
          <p className="text-sm italic text-muted-foreground">
            From the Campfire: &ldquo;Started at 44%, passed June 2025.&rdquo;
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            &mdash; Maria S., PUP Architecture
          </p>
        </div>

        {/* Pricing */}
        <div className="mt-8 text-center">
          <p className="text-2xl font-bold text-foreground">
            &#8369;6,999<span className="text-sm font-normal text-muted-foreground">/cycle</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            &#8369;9,999/year &middot; Save 29%
          </p>
        </div>

        {/* Payment CTAs — GCash FIRST (Philippines context) */}
        <div className="flex justify-center">
          <UpgradeButtons tier="pro" />
        </div>

        {/* "Not yet — continue free" — ALWAYS visible, never buried */}
        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground"
          >
            Not yet — continue free
          </Link>
        </div>

        {/* Trust line */}
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Secure payment &middot; Cancel anytime
        </p>
      </div>
    </SharedPageLayout>
  )
}

export default UpgradePage
