import { parseMdxProp } from '../shared/parse-mdx-prop'

interface SnapshotItem {
  label: string
  value: string
  hero?: boolean
}

/**
 * SubjectSnapshot — compact metadata bar for subject overview articles.
 *
 * Design: "Hero Stat + Supporting Grid"
 * - The item marked `hero: true` (or the first item containing "%" or with
 *   a label matching "weight") is displayed large on the left
 * - Remaining items render in a compact grid to the right
 * - Top border accent in Camp Cobalt (differentiates from left-bordered LEA callout)
 */
export const SubjectSnapshot = ({ items }: { items: SnapshotItem[] | string }) => {
  const parsed = parseMdxProp<SnapshotItem[]>(items, [])
  if (parsed.length === 0) return null

  // Auto-detect hero stat: explicit `hero: true`, or first item with "%" in value or "weight" in label
  const heroIdx = parsed.findIndex(
    (item) =>
      item.hero === true ||
      item.value.includes('%') ||
      item.label.toLowerCase().includes('weight'),
  )

  const hero = heroIdx >= 0 ? parsed[heroIdx] : null
  const supporting = parsed.filter((_, i) => i !== heroIdx)

  // If no hero detected, render all items in a flat grid (fallback)
  if (!hero) {
    return (
      <div className="not-prose my-5 rounded-md border border-camp-cobalt/20 bg-surface-light dark:bg-[var(--wiki-panel-dark)] px-5 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
          {parsed.map((item, i) => (
            <SupportingItem key={i} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="not-prose my-5 rounded-md border border-camp-cobalt/20 bg-surface-light dark:bg-[var(--wiki-panel-dark)]">
      <div className="flex flex-col sm:flex-row">
        {/* Hero stat — left zone */}
        <div className="flex flex-col items-center justify-center px-6 py-5 sm:min-w-[140px] sm:border-r sm:border-border dark:sm:border-wiki-invert-divider">
          <div className="text-[36px] font-bold text-camp-cobalt leading-none">
            {hero.value}
          </div>
          <div className="font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-ink-tertiary dark:text-[var(--wiki-soft-muted)] mt-1.5">
            {hero.label}
          </div>
        </div>

        {/* Supporting stats — right zone */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 px-5 py-4 border-t sm:border-t-0 border-wiki-divider dark:border-wiki-invert-divider">
          {supporting.map((item, i) => (
            <SupportingItem key={i} label={item.label} value={item.value} />
          ))}
        </div>
      </div>
    </div>
  )
}

const SupportingItem = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <div className="font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-ink-tertiary dark:text-[var(--wiki-soft-muted)] mb-0.5">
      {label}
    </div>
    <div className="text-[15px] font-semibold text-ink-primary dark:text-[var(--wiki-soft-heading)] leading-snug">
      {value}
    </div>
  </div>
)
