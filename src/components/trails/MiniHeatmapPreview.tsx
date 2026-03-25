'use client'

import type { NodeMasteryState } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  Mastery level → dot color mapping                                  */
/* ------------------------------------------------------------------ */

const MASTERY_DOT_COLOR: Record<NodeMasteryState['mastery_level'], string> = {
  grey: 'bg-[border]',
  red: 'bg-[destructive]',
  amber: 'bg-[warning]',
  green: 'bg-[emerald]',
}

const MAX_VISIBLE_NODES = 8

/* ------------------------------------------------------------------ */
/*  MiniHeatmapPreview                                                 */
/* ------------------------------------------------------------------ */

interface MiniHeatmapPreviewProps {
  nodeStates: NodeMasteryState[]
  targetNodeIds: string[]
  subjectName: string
}

export const MiniHeatmapPreview = ({
  nodeStates,
  targetNodeIds,
  subjectName,
}: MiniHeatmapPreviewProps) => {
  const targetSet = new Set(targetNodeIds)
  const targetedNodes = nodeStates.filter((n) => targetSet.has(n.node_id))
  const coveredCount = targetedNodes.filter((n) => n.mastery_level === 'green').length
  const allMastered = targetedNodes.length > 0 && coveredCount === targetedNodes.length

  const visibleNodes = targetedNodes.slice(0, MAX_VISIBLE_NODES)
  const overflowCount = targetedNodes.length - MAX_VISIBLE_NODES

  return (
    <div className="flex flex-col gap-2">
      {/* Label */}
      <span className="font-mono text-[11px] uppercase tracking-wider text-[text-tertiary]">
        Today&apos;s Coverage Map
      </span>

      {/* Subject name */}
      <span className="text-sm font-medium text-[text-primary]">{subjectName}</span>

      {/* Node dots */}
      <div className="flex flex-wrap items-center gap-1.5">
        {visibleNodes.map((node) => (
          <div
            key={node.node_id}
            className={`h-3 w-3 rounded-full ${MASTERY_DOT_COLOR[node.mastery_level]} transition-colors duration-150 ease-out`}
            title={`${node.node_id}: ${node.mastery_level}`}
          />
        ))}
        {overflowCount > 0 && (
          <span className="text-xs text-[text-tertiary]">+{overflowCount} more</span>
        )}
      </div>

      {/* Summary */}
      {allMastered ? (
        <p className="text-xs text-[text-secondary] leading-relaxed">
          You&apos;ve already mastered these topics. Today is consolidation
          &mdash; your score is protecting these gains.
        </p>
      ) : (
        <p className="text-xs text-[text-secondary]">
          {targetedNodes.length} nodes targeted &middot; {coveredCount} already
          covered
        </p>
      )}
    </div>
  )
}
