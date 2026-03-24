import type { WikiMistakeProps } from '@/types/wiki'

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'of', 'in', 'for', 'to', 'is', 'and', 'or',
  'with', 'that', 'by', 'as', 'on', 'at', 'it', 'its', 'from',
])

/** Truncate at word boundary, trim trailing stop words. */
export function shorten(text: string, maxLen = 80): string {
  const trimmed = text.trim()
  if (trimmed.length <= maxLen) return trimmed

  const cut = trimmed.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  let result = lastSpace > 0 ? cut.slice(0, lastSpace) : cut

  // Trim trailing stop words
  let words = result.split(' ')
  while (words.length > 1 && STOP_WORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop()
  }
  result = words.join(' ')

  return result.length < trimmed.length ? result + '…' : result
}

/**
 * Transform a plain mistake string into a structured WikiMistakeProps object
 * by pattern-matching common formats from MDX content.
 */
export function transformMistakeString(text: string, index: number): WikiMistakeProps {
  const base = { number: index + 1, explanation: text }
  const t = text.trim()

  // 1. "Confusing X with Y"
  const confusing = t.match(/^Confusing\s+(.+?)\s+with\s+(.+)$/i)
  if (confusing) {
    return { ...base, title: `${shorten(confusing[1])} vs ${shorten(confusing[2])}`, wrongValue: confusing[1], correctValue: confusing[2] }
  }

  // 2. "Assuming X — actually Y" / "Assuming X when actually Y"
  const assumingWith = t.match(/^Assuming\s+(.+?)\s*(?:—|--)\s*actually\s+(.+)$/i)
    ?? t.match(/^Assuming\s+(.+?)\s+when\s+actually\s+(.+)$/i)
  if (assumingWith) {
    return { ...base, title: shorten(assumingWith[1]), wrongValue: `Assuming ${assumingWith[1]}`, correctValue: assumingWith[2] }
  }

  // 3. "Assuming X" (no correction)
  const assumingOnly = t.match(/^Assuming\s+(.+)$/i)
  if (assumingOnly) {
    return { ...base, title: shorten(assumingOnly[1]), wrongValue: t, correctValue: 'Verify actual requirements' }
  }

  // 4. "Treating X as Y — actually Z"
  const treatingFull = t.match(/^Treating\s+(.+?)\s+as\s+(.+?)\s*(?:—|--)\s*actually\s+(.+)$/i)
  if (treatingFull) {
    return { ...base, title: shorten(treatingFull[1]), wrongValue: `Treating as ${treatingFull[2]}`, correctValue: treatingFull[3] }
  }

  // 5. "Treating X as Y" (simple)
  const treatingSimple = t.match(/^Treating\s+(.+?)\s+as\s+(.+)$/i)
  if (treatingSimple) {
    return { ...base, title: shorten(treatingSimple[1]), wrongValue: t, correctValue: 'Understand the correct classification' }
  }

  // 6. "Failing to / Omitting / Neglecting / Overlooking / Ignoring / Missing X"
  const omission = t.match(/^(?:Failing\s+to|Omitting|Neglecting|Overlooking|Ignoring|Missing)\s+(.+)$/i)
  if (omission) {
    return { ...base, title: shorten(omission[1]), wrongValue: 'Often omitted or overlooked', correctValue: shorten(omission[1]) }
  }

  // 7. "Using/Applying/Misapplying X instead of Y"
  const instead = t.match(/^(?:Using|Applying|Misapplying)\s+(.+?)\s+instead\s+of\s+(.+)$/i)
  if (instead) {
    return { ...base, title: `${shorten(instead[1])} vs ${shorten(instead[2])}`, wrongValue: instead[1], correctValue: instead[2] }
  }

  // 8. Fallback: split on em-dash or semicolon
  const dashSplit = t.split(/\s*(?:—|--)\s*|;\s*/)
  if (dashSplit.length >= 2) {
    return { ...base, title: shorten(dashSplit[0]), wrongValue: t, correctValue: dashSplit.slice(1).join('; ').trim() }
  }

  return { ...base, title: shorten(t), wrongValue: t, correctValue: 'Review this concept' }
}
