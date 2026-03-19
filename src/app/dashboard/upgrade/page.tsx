import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { trackServerEvent } from '@/lib/analytics-server'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

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
        {/* Headline — Syne 800, 36px */}
        <h1 className="font-[family-name:var(--font-syne)] text-[36px] font-extrabold leading-tight tracking-tight text-[#1A2332]">
          Know you&apos;ll win.
        </h1>

        {/* Value statement — Inter 16px */}
        <p className="mt-4 text-base text-[#4A5568] leading-relaxed">
          Pro students see their live score, full heatmap, and a Day-by-Day Trail
          built around their gaps.
        </p>

        {/* Feature Comparison Table */}
        <div className="mt-8 overflow-hidden rounded-md border border-[#D4DAE3]">
          <div className="grid grid-cols-3 bg-[#1A2332] px-4 py-3">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#8896A7]" />
            <div className="text-center text-[11px] font-medium uppercase tracking-wider text-[#8896A7]">
              Free
            </div>
            <div className="text-center text-[11px] font-medium uppercase tracking-wider text-white">
              Pro
            </div>
          </div>
          {FEATURE_COMPARISON.map((row, i) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 items-center px-4 py-3 border-t border-[#D4DAE3] ${
                i % 2 === 0 ? 'bg-white' : 'bg-[#F8F7F5]'
              }`}
            >
              <div className="text-sm font-medium text-[#1A2332]">{row.feature}</div>
              <div className="text-center text-sm text-[#8896A7]">{row.free}</div>
              <div className="text-center text-sm font-medium text-[#1A2332]">{row.pro}</div>
            </div>
          ))}
        </div>

        {/* Social Proof — Campfire (UX Strategy Section 15) */}
        <div className="mt-8 rounded-md border border-[#D4DAE3] bg-white p-4">
          <p className="text-sm italic text-[#4A5568]">
            From the Campfire: &ldquo;Started at 44%, passed June 2025.&rdquo;
          </p>
          <p className="mt-1 text-xs text-[#8896A7]">
            &mdash; Maria S., PUP Architecture
          </p>
        </div>

        {/* Pricing */}
        <div className="mt-8 text-center">
          <p className="text-2xl font-bold text-[#1A2332]">
            &#8369;6,999<span className="text-sm font-normal text-[#4A5568]">/cycle</span>
          </p>
          <p className="mt-1 text-sm text-[#4A5568]">
            &#8369;9,999/year &middot; Save 29%
          </p>
        </div>

        {/* Payment CTAs — GCash FIRST (Philippines context) */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            className="w-full max-w-sm rounded-sm px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
            style={{ backgroundColor: '#1B3FC4' }}
          >
            Pay with GCash
          </button>
          <button
            className="w-full max-w-sm rounded-sm border border-[#D4DAE3] bg-white px-6 py-3.5 text-sm font-medium text-[#1A2332] transition-colors duration-150 ease-out hover:bg-[#F8F7F5]"
          >
            Pay with Card
          </button>
        </div>

        {/* "Not yet — continue free" — ALWAYS visible, never buried */}
        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-sm text-[#4A5568] transition-colors duration-150 ease-out hover:text-[#1A2332]"
          >
            Not yet — continue free
          </Link>
        </div>

        {/* Trust line */}
        <p className="mt-3 text-center text-xs text-[#8896A7]">
          Secure payment &middot; Cancel anytime
        </p>
      </div>
    </SharedPageLayout>
  )
}

export default UpgradePage
