import { WikiChangedPill } from './WikiChangedPill'
import { cn } from '@/lib/utils'
import type { WikiTableProps } from '@/types/wiki'

export const WikiExamTable = ({ caption, columns = [], rows = [], hasSourceColumn = true }: WikiTableProps) => {
  if (!columns.length || !rows.length) return null
  return (
    <div className="not-prose my-6 rounded-lg border border-wiki-border overflow-hidden dark:border-wiki-invert-divider">
      {caption && (
        <p className="font-sans text-xs font-semibold text-wiki-ink px-3 py-2.5 border-b border-wiki-border bg-muted dark:text-wiki-invert-heading dark:bg-[var(--wiki-panel-dark-alt)] dark:border-wiki-invert-divider">
          {caption}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[var(--wiki-row-light)] dark:bg-wiki-surface-dark">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-wiki-muted px-2.5 py-2 text-left border-b border-wiki-border dark:border-wiki-invert-divider",
                    i === columns.length - 1 && hasSourceColumn && "hidden sm:table-cell"
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              if (row.isSectionHeader) {
                return (
                  <tr key={i} className="bg-primary/10 dark:bg-primary/15">
                    <td
                      colSpan={columns.length}
                      className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-camp-cobalt px-2.5 py-1.5"
                    >
                      {row.parameter}
                    </td>
                  </tr>
                )
              }
              return (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-wiki-divider last:border-b-0 dark:border-wiki-invert-divider",
                    row.isMostTested && "bg-signal-gold-light dark:bg-warning-700/15"
                  )}
                >
                  <td className="px-2.5 py-2.5 text-sm text-wiki-ink dark:text-wiki-invert-heading">
                    <span>{row.parameter}</span>
                    {row.isChanged && <WikiChangedPill className="ml-1.5" />}
                  </td>
                  {row.dimension != null && (
                    <td className="px-2.5 py-2.5 text-xs text-ink-muted dark:text-wiki-muted">
                      {row.dimension}
                    </td>
                  )}
                  <td
                    className={cn(
                      "px-2.5 py-2.5 text-sm font-semibold",
                      row.isMostTested
                        ? "text-signal-gold-deep dark:text-formula-highlight"
                        : "text-camp-cobalt"
                    )}
                  >
                    {row.value}
                  </td>
                  {hasSourceColumn && (
                    <td className="px-2.5 py-2.5 font-[var(--font-dm-mono)] text-[11px] text-wiki-muted hidden sm:table-cell">
                      {row.source}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
