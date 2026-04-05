'use client'

import * as React from 'react'
import type { AccessibilityRow } from './accessibility-data'

interface AccessibilityChangesTableProps {
  rows?: string // JSON string passed from MDX via convertExpressionPropsToStrings
}

export const AccessibilityChangesTable = ({ rows }: AccessibilityChangesTableProps) => {
  const [activeRow, setActiveRow] = React.useState<number | null>(null)

  const data: AccessibilityRow[] = React.useMemo(() => {
    if (!rows) return []
    try {
      return JSON.parse(rows) as AccessibilityRow[]
    } catch {
      return []
    }
  }, [rows])

  if (data.length === 0) return <p>No data provided.</p>

  return (
    <div className="not-prose my-5 rounded-lg border border-[var(--widget-border)] bg-muted px-6 py-5">
      <div className="font-dm-mono text-[11px] uppercase tracking-[0.08em] text-camp-cobalt mb-2">Interactive — 2024 vs 2013 Comparison</div>
      <p className="text-[13px] text-[var(--widget-text)] mb-3.5">Click any row to see what changed and why it matters for the ALE.</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="bg-camp-cobalt">
              <th className="px-2.5 py-2 text-left text-white font-semibold">Element</th>
              <th className="px-2.5 py-2 text-center text-white font-semibold">2013 IRR</th>
              <th className="px-2.5 py-2 text-center text-camp-amber font-semibold">2024 IRR ★</th>
              <th className="px-2.5 py-2 text-left text-white font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d, i) => {
              const changed = d.old !== d.n
              return (
                <tr
                  key={i}
                  onClick={() => setActiveRow(activeRow === i ? null : i)}
                  className="border-b border-[var(--wiki-border)] cursor-pointer hover:bg-camp-cobalt/[0.04] transition-colors duration-150"
                  style={{ background: activeRow === i ? '#eef1fb' : undefined }}
                >
                  <td className="px-2.5 py-2 font-medium text-[var(--widget-ink)]">{d.elem}</td>
                  <td className="px-2.5 py-2 text-center text-marketing-tertiary font-dm-mono text-[11px]">{d.old}</td>
                  <td className={`px-2.5 py-2 text-center font-dm-mono text-[11px] font-semibold ${changed ? 'text-camp-red' : 'text-camp-green'}`}>
                    {d.n} {changed ? '★' : '✓'}
                  </td>
                  <td className="px-2.5 py-2 text-[11px] text-text-2">{d.src}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {activeRow !== null && data[activeRow] && (
        <div className="mt-3.5 p-3 px-4 bg-white border-[1.5px] border-camp-cobalt rounded-md text-[13px] text-[var(--widget-ink)]">
          <strong className="text-camp-cobalt">{data[activeRow].elem}</strong>
          {' — '}
          <span className="font-dm-mono text-[11px] text-marketing-tertiary">{data[activeRow].src}</span>
          <br /><br />
          {data[activeRow].detail}
        </div>
      )}
    </div>
  )
}
