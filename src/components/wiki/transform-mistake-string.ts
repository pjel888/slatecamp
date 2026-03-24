import type { WikiMistakeProps } from '@/types/wiki'

/**
 * Transform a plain mistake string into a structured WikiMistakeProps object
 * by pattern-matching common formats from MDX content.
 *
 * NEVER truncate any field — this is a study platform where every word matters.
 * All extracted text is passed through in full.
 */
export function transformMistakeString(text: string, index: number): WikiMistakeProps {
  const base = { number: index + 1, explanation: text }
  const t = text.trim()

  // 1. "Confusing X with Y"
  const confusing = t.match(/^Confusing\s+(.+?)\s+with\s+(.+)$/i)
  if (confusing) {
    return { ...base, title: `${confusing[1]} vs ${confusing[2]}`, wrongValue: confusing[1], correctValue: confusing[2] }
  }

  // 2. "Assuming X — actually Y" / "Assuming X when actually Y"
  const assumingWith = t.match(/^Assuming\s+(.+?)\s*(?:—|--)\s*actually\s+(.+)$/i)
    ?? t.match(/^Assuming\s+(.+?)\s+when\s+actually\s+(.+)$/i)
  if (assumingWith) {
    return { ...base, title: assumingWith[1], wrongValue: `Assuming ${assumingWith[1]}`, correctValue: assumingWith[2] }
  }

  // 3. "Assuming X" (no correction)
  const assumingOnly = t.match(/^Assuming\s+(.+)$/i)
  if (assumingOnly) {
    return { ...base, title: assumingOnly[1], wrongValue: t, correctValue: 'Verify actual requirements' }
  }

  // 4. "Treating X as Y — actually Z"
  const treatingFull = t.match(/^Treating\s+(.+?)\s+as\s+(.+?)\s*(?:—|--)\s*actually\s+(.+)$/i)
  if (treatingFull) {
    return { ...base, title: treatingFull[1], wrongValue: `Treating as ${treatingFull[2]}`, correctValue: treatingFull[3] }
  }

  // 5. "Treating X as Y" (simple)
  const treatingSimple = t.match(/^Treating\s+(.+?)\s+as\s+(.+)$/i)
  if (treatingSimple) {
    return { ...base, title: treatingSimple[1], wrongValue: t, correctValue: 'Understand the correct classification' }
  }

  // 6. "Failing to / Omitting / Neglecting / Overlooking / Ignoring / Missing X"
  const omission = t.match(/^(?:Failing\s+to|Omitting|Neglecting|Overlooking|Ignoring|Missing)\s+(.+)$/i)
  if (omission) {
    return { ...base, title: omission[1], wrongValue: 'Often omitted or overlooked', correctValue: omission[1] }
  }

  // 7. "Using/Applying/Misapplying X instead of Y"
  const instead = t.match(/^(?:Using|Applying|Misapplying)\s+(.+?)\s+instead\s+of\s+(.+)$/i)
  if (instead) {
    return { ...base, title: `${instead[1]} vs ${instead[2]}`, wrongValue: instead[1], correctValue: instead[2] }
  }

  // 8. Fallback: split on em-dash or semicolon
  const dashSplit = t.split(/\s*(?:—|--)\s*|;\s*/)
  if (dashSplit.length >= 2) {
    return { ...base, title: dashSplit[0], wrongValue: t, correctValue: dashSplit.slice(1).join('; ').trim() }
  }

  return { ...base, title: t, wrongValue: t, correctValue: 'Review this concept' }
}
