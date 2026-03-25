import { WikiChangedPill } from './WikiChangedPill'
import { cn } from '@/lib/utils'
import type { WikiTableProps } from '@/types/wiki'

export const WikiExamTable = ({ caption, columns, rows, hasSourceColumn = true }: WikiTableProps) => {
  return (
    <div className="not-prose my-6 rounded-lg border border-[#E0DED8] overflow-hidden dark:border-[#3A3835]">
      {caption && (
        <p className="font-sans text-xs font-semibold text-[#1A1A1A] px-3 py-2.5 border-b border-[#E0DED8] bg-[#F5F5F5] dark:text-[#E2E0D8] dark:bg-[#2A2825] dark:border-[#3A3835]">
          {caption}
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#FAFAF8] dark:bg-[#252320]">
              {columns.map((col, i) => (
                <th
                  key={i}
                  className={cn(
                    "font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-[#A8A8A5] px-2.5 py-2 text-left border-b border-[#E0DED8] dark:border-[#3A3835]",
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
                  <tr key={i} className="bg-[#1B3FC414] dark:bg-[#1B3FC420]">
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
                    "border-b border-[#ECEAE4] last:border-b-0 dark:border-[#3A3835]",
                    row.isMostTested && "bg-[#FFF8E6] dark:bg-[#92400E20]"
                  )}
                >
                  <td className="px-2.5 py-2.5 text-sm text-[#1A1A1A] dark:text-[#E2E0D8]">
                    <span>{row.parameter}</span>
                    {row.isChanged && <WikiChangedPill className="ml-1.5" />}
                  </td>
                  {row.dimension != null && (
                    <td className="px-2.5 py-2.5 text-xs text-[#737370] dark:text-[#A8A8A5]">
                      {row.dimension}
                    </td>
                  )}
                  <td
                    className={cn(
                      "px-2.5 py-2.5 text-sm font-semibold",
                      row.isMostTested
                        ? "text-[#92400E] dark:text-[#F5C842]"
                        : "text-camp-cobalt"
                    )}
                  >
                    {row.value}
                  </td>
                  {hasSourceColumn && (
                    <td className="px-2.5 py-2.5 font-[var(--font-dm-mono)] text-[11px] text-[#A8A8A5] hidden sm:table-cell">
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
