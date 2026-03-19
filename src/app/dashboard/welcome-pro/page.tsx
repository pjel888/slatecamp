import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { isPaidUser } from '@/lib/paywall/check-access'
import { trackServerEvent } from '@/lib/analytics-server'

/**
 * Pro Confirmation Screen — UX Strategy Section 15 (Step 3)
 *
 * "Welcome to Camp, [name]."
 * Immediately shows: Live Readiness Score + Full Heatmap unblurred.
 * "The Pro confirmation screen IS the second score reveal moment."
 */

const WelcomeProPage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect('/login')

  const paid = await isPaidUser()
  if (!paid) redirect('/dashboard')

  const supabase = await createClient()
  const { data: stats } = await supabase
    .from('user_global_stats')
    .select('global_readiness_score')
    .eq('user_id', user.id)
    .single()

  const score = Math.round(stats?.global_readiness_score ?? 0)
  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'

  // Zone color for score
  const scoreColor =
    score < 40 ? '#D64545' :
    score < 70 ? '#E8853A' :
    score < 85 ? '#2D9F6F' :
    '#1B3FC4'

  void trackServerEvent('pro_welcome_viewed', { score })

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: '#EDFAF4' }}
    >
      <div className="mx-auto w-full max-w-lg text-center">
        {/* Welcome headline */}
        <h1 className="font-[family-name:var(--font-syne)] text-[36px] font-extrabold leading-tight text-[#1A2332]">
          Welcome to Camp, {firstName}.
        </h1>

        {/* Live Readiness Score — the payoff */}
        <div className="mt-8">
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[2.5px] text-[#4A5568]">
            Your Readiness Score
          </p>
          <p
            className="mt-2 font-[family-name:var(--font-syne)] text-[72px] font-extrabold leading-none tabular-nums"
            style={{ color: scoreColor }}
          >
            {score}%
          </p>
          <p className="mt-2 text-sm text-[#4A5568]">
            Live — updates after every session.
          </p>
        </div>

        {/* Unblurred heatmap teaser — showing it's now accessible */}
        <div className="mt-8 rounded-md border border-[#D4DAE3] bg-white p-4">
          <p className="text-sm font-medium text-[#2D9F6F]">
            Full Taxonomy Heatmap — unlocked
          </p>
          <p className="mt-1 text-xs text-[#4A5568]">
            Every node, every subject, every gap — visible and actionable.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center justify-center rounded-sm px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
          style={{ backgroundColor: '#1B3FC4' }}
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default WelcomeProPage
