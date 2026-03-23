/**
 * Session Discovery — UX Strategy Section 10 (Variable Reward)
 * One surprising data insight per session. Genuine, non-manipulative.
 * "You answered fastest in Building Laws. Slowest in Utilities."
 */

interface SessionDiscoveryProps {
  insight: {
    type: 'speed_comparison' | 'accuracy_trend' | 'retry_success' | 'subject_strength' | 'time_pattern'
    message: string
  } | null
}

export const SessionDiscovery = ({ insight }: SessionDiscoveryProps) => {
  if (!insight) return null

  return (
    <div className="rounded-md border border-[#D4DAE3] bg-[#F5F5F5] p-4">
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[1.5px] text-[#8896A7]">
        Session insight
      </p>
      <p className="mt-1.5 text-sm text-[#1A2332] leading-relaxed">
        {insight.message}
      </p>
    </div>
  )
}
