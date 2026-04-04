import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { isPaidUser } from '@/lib/paywall/check-access'
import { trackServerEvent } from '@/lib/analytics-server'
import { getSubjectName } from '@/types/testing'

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

  // Fetch stats and mastery nodes in parallel — both only need user.id
  const [{ data: stats }, { data: masteryNodes }] = await Promise.all([
    supabase
      .from('user_global_stats')
      .select('global_readiness_score')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('user_node_mastery')
      .select('current_mastery_weight, taxonomy_tree(subject_area)')
      .eq('user_id', user.id)
      .gt('total_attempts', 0)
      .order('current_mastery_weight', { ascending: true })
      .limit(20),
  ])

  const subjectSummary = new Map<string, { total: number; green: number; amber: number; red: number }>()
  for (const node of (masteryNodes ?? []) as any[]) {
    const sa = getSubjectName(node.taxonomy_tree?.subject_area)
    const entry = subjectSummary.get(sa) ?? { total: 0, green: 0, amber: 0, red: 0 }
    entry.total++
    if (node.current_mastery_weight >= 0.7) entry.green++
    else if (node.current_mastery_weight >= 0.4) entry.amber++
    else entry.red++
    subjectSummary.set(sa, entry)
  }

  const score = Math.round(stats?.global_readiness_score ?? 0)
  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? user.email?.split('@')[0] ?? 'there'

  // Zone color for score
  const scoreColor =
    score < 40 ? 'var(--destructive)' :
    score < 70 ? 'var(--accent)' :
    score < 85 ? 'var(--success)' :
    'var(--primary)'

  void trackServerEvent('pro_welcome_viewed', { score })

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 bg-emerald-50"
    >
      <div className="mx-auto w-full max-w-lg text-center">
        {/* Welcome headline */}
        <h1 className="font-[family-name:var(--font-boldonse)] text-[36px] font-extrabold leading-tight text-foreground">
          Welcome to Camp, {firstName}.
        </h1>

        {/* Live Readiness Score — the payoff */}
        <div className="mt-8">
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[2.5px] text-muted-foreground">
            Your Readiness Score
          </p>
          <p
            className="mt-2 font-[family-name:var(--font-boldonse)] text-[72px] font-extrabold leading-none tabular-nums"
            style={{ color: scoreColor }}
          >
            {score}%
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Live — updates after every session.
          </p>
        </div>

        {/* Unblurred heatmap — the exact thing they were deprived of */}
        <div className="mt-8 rounded-md border border-border bg-white p-4">
          <p className="text-sm font-medium text-emerald mb-3">
            Full Taxonomy Heatmap — unlocked
          </p>
          {subjectSummary.size > 0 ? (
            <div className="flex flex-col gap-2">
              {Array.from(subjectSummary.entries()).map(([subject, counts]) => (
                <div key={subject} className="flex items-center justify-between text-xs">
                  <span className="text-foreground font-medium truncate mr-3">{subject}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {counts.green > 0 && (
                      <span className="flex items-center gap-0.5">
                        <span className="h-2 w-2 rounded-full bg-emerald" />
                        <span className="text-emerald">{counts.green}</span>
                      </span>
                    )}
                    {counts.amber > 0 && (
                      <span className="flex items-center gap-0.5">
                        <span className="h-2 w-2 rounded-full bg-warning" />
                        <span className="text-warning">{counts.amber}</span>
                      </span>
                    )}
                    {counts.red > 0 && (
                      <span className="flex items-center gap-0.5">
                        <span className="h-2 w-2 rounded-full bg-destructive" />
                        <span className="text-destructive">{counts.red}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Every node, every subject, every gap — visible and actionable.
            </p>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center justify-center rounded-sm bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary/90"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default WelcomeProPage
