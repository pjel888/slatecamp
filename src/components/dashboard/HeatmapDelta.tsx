/**
 * Heatmap Delta — UX Strategy Section 11
 * "2 nodes moved amber → green since yesterday."
 * The emotional center of progress — shown on Day Complete and Session Complete.
 */

interface NodeChange {
  nodeName: string
  subjectArea: string
  previousState: 'red' | 'amber' | 'grey'
  newState: 'red' | 'amber' | 'green'
}

interface HeatmapDeltaProps {
  changes: NodeChange[]
  /** Optional label — "since yesterday" or "this session" */
  timeframe?: string
}

const STATE_COLORS: Record<string, string> = {
  red: '#D64545',
  amber: '#D4951A',
  green: '#2D9F6F',
  grey: '#D4DAE3',
}

const STATE_LABELS: Record<string, string> = {
  red: 'Needs work',
  amber: 'Developing',
  green: 'Strong',
  grey: 'Unexplored',
}

export const HeatmapDelta = ({ changes, timeframe = 'this session' }: HeatmapDeltaProps) => {
  if (changes.length === 0) return null

  // Only show improvements (previous → better state)
  const improvements = changes.filter(
    (c) =>
      (c.previousState === 'red' && (c.newState === 'amber' || c.newState === 'green')) ||
      (c.previousState === 'amber' && c.newState === 'green') ||
      (c.previousState === 'grey' && (c.newState === 'amber' || c.newState === 'green')),
  )

  if (improvements.length === 0) return null

  return (
    <div className="rounded-md border border-[#D4DAE3] bg-white p-4">
      <p className="text-sm font-medium text-[#1A2332]">
        {improvements.length} {improvements.length === 1 ? 'node' : 'nodes'} improved {timeframe}
      </p>
      <div className="mt-2 flex flex-col gap-1.5">
        {improvements.map((change) => (
          <div key={change.nodeName} className="flex items-center gap-2 text-xs">
            {/* Before dot */}
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: STATE_COLORS[change.previousState] }}
              title={STATE_LABELS[change.previousState]}
            />
            <span className="text-[#8896A7]">&rarr;</span>
            {/* After dot */}
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: STATE_COLORS[change.newState] }}
              title={STATE_LABELS[change.newState]}
            />
            <span className="text-[#4A5568]">
              {change.nodeName}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
