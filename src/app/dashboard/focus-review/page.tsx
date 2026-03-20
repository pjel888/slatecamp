import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient, getUser } from '@/lib/supabase/server'
import { getActiveBlindspotQueue } from '@/lib/blindspot/generate-queue'
import { checkFeatureAccess } from '@/lib/paywall/check-access'
import SharedPageLayout from '@/components/layouts/SharedPageLayout'

/**
 * Blindspot Protocol Detail — UX Strategy Section 13
 *
 * "Building Laws nodes have been Red for 3 weeks. A focused session is ready."
 * Never say "You're struggling with." Factual information + specific action.
 */

const MASTERY_STATE = (weight: number) => {
  if (weight >= 0.7) return { label: 'Strong', color: '#2D9F6F', bg: '#EDFAF4' }
  if (weight >= 0.4) return { label: 'Developing', color: '#D4951A', bg: '#FEF8ED' }
  return { label: 'Needs work', color: '#D64545', bg: '#FDF0F0' }
}

const FocusReviewPage = async () => {
  const { data: { user } } = await getUser()
  if (!user) redirect('/login')

  const access = await checkFeatureAccess('blindspot_protocol')
  if (!access.allowed) redirect('/dashboard/upgrade')

  const queue = await getActiveBlindspotQueue(user.id)

  if (!queue) {
    return (
      <SharedPageLayout>
        <div className="mx-auto w-full max-w-xl text-center py-12">
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#8896A7]">
            Focus Review
          </p>
          <p className="mt-4 text-sm text-[#4A5568]">
            No focus areas identified right now. The system scans nightly and will
            surface topics that need attention when patterns emerge.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center text-sm text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150"
          >
            &larr; Back to Dashboard
          </Link>
        </div>
      </SharedPageLayout>
    )
  }

  // Get node details for the queue
  const supabase = await createClient()
  const { data: nodes } = await supabase
    .from('user_node_mastery')
    .select('topic_id, current_mastery_weight, total_attempts, last_encountered, taxonomy_tree(name, subject_area)')
    .eq('user_id', user.id)
    .in('topic_id', queue.node_ids)

  const nodeDetails = (nodes ?? []).map((n: any) => ({
    name: n.taxonomy_tree?.name ?? 'Unknown',
    subjectArea: n.taxonomy_tree?.subject_area ?? '',
    mastery: Math.round((n.current_mastery_weight ?? 0) * 100),
    attempts: n.total_attempts ?? 0,
    ...MASTERY_STATE(n.current_mastery_weight ?? 0),
  }))

  const subjects = [...new Set(nodeDetails.map((n) => n.subjectArea))].filter(Boolean)

  return (
    <SharedPageLayout>
      <div className="mx-auto w-full max-w-xl">
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#8896A7]">
          Focus Review
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-[#1A2332]">
          {subjects.join(', ')} nodes have been Red for 3+ weeks
        </h1>
        <p className="mt-2 text-sm text-[#4A5568] leading-relaxed">
          A focused session is ready. {queue.question_count} questions targeting the specific
          patterns causing these nodes to stay at their current level.
        </p>

        {/* Node cluster detail */}
        <div className="mt-6 flex flex-col gap-2">
          {nodeDetails.map((node) => (
            <div
              key={node.name}
              className="flex items-center justify-between rounded-md border border-[#D4DAE3] bg-white p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: node.color }}
                />
                <div>
                  <p className="text-sm font-medium text-[#1A2332]">{node.name}</p>
                  <p className="text-xs text-[#8896A7]">{node.subjectArea}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className="font-[family-name:var(--font-dm-mono)] text-sm font-medium"
                  style={{ color: node.color }}
                >
                  {node.mastery}%
                </p>
                <p className="text-xs text-[#8896A7]">
                  {node.attempts} attempts
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Session description */}
        <div className="mt-6 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] p-4">
          <p className="text-sm text-[#4A5568]">
            5&ndash;7 days &middot; {queue.question_count} questions per day &middot;
            Targets the specific misunderstandings causing these nodes to stay at their current level.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/dashboard/review?mode=blindspot&queue=${queue.queue_id}`}
            className="inline-flex w-full items-center justify-center rounded-sm px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
            style={{ backgroundColor: '#1B3FC4' }}
          >
            Start Remediation
          </Link>
          <Link
            href="/dashboard"
            className="text-center text-sm text-[#4A5568] hover:text-[#1A2332] transition-colors duration-150"
          >
            Remind me tomorrow
          </Link>
        </div>
      </div>
    </SharedPageLayout>
  )
}

export default FocusReviewPage
