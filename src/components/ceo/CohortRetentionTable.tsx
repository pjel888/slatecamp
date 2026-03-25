'use client'

import { cn } from '@/lib/utils'
import type { CohortRow } from '@/types/ceo'

interface CohortRetentionTableProps {
  data: CohortRow[]
}

const WEEK_LABELS = ['W0', 'W1', 'W2', 'W3', 'W4', 'W6', 'W8', 'W12']

const getCellStyle = (value: number): string => {
  if (value < 0) return 'bg-muted/30 text-muted-foreground'
  if (value >= 0.7) return 'bg-success/20 text-success'
  if (value >= 0.5) return 'bg-success/10 text-success'
  if (value >= 0.3) return 'bg-warning/10 text-warning'
  return 'bg-muted text-muted-foreground'
}

const formatCohortMonth = (cohortMonth: string): string => {
  const [year, month] = cohortMonth.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export const CohortRetentionTable = ({ data }: CohortRetentionTableProps) => {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-md p-6 text-center">
        <p className="text-[13px] text-muted-foreground">
          Cohort analysis requires at least 2 months of user activity. Currently
          collecting data.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Cohort
              </th>
              <th className="text-right px-3 py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Users
              </th>
              {WEEK_LABELS.map((label) => (
                <th
                  key={label}
                  className="text-center px-3 py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground whitespace-nowrap"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={row.cohortMonth}
                className={cn(
                  'border-b border-border last:border-0',
                  rowIdx % 2 === 1 && 'bg-muted/20',
                )}
              >
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className="font-mono text-[12px] text-foreground">
                    {formatCohortMonth(row.cohortMonth)}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <span className="font-mono text-[12px] tabular-nums text-muted-foreground">
                    {row.totalUsers.toLocaleString()}
                  </span>
                </td>
                {row.retentionByWeek.map((val, colIdx) => (
                  <td key={colIdx} className="px-1.5 py-1.5 text-center">
                    <span
                      className={cn(
                        'inline-block px-2 py-1 rounded-sm font-mono text-[12px] tabular-nums w-14 text-center',
                        getCellStyle(val),
                      )}
                    >
                      {val < 0 ? '—' : `${Math.round(val * 100)}%`}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
