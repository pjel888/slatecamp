'use client'

import { useWallComputation } from '../../hooks/useWallComputation'
import { useWallConfigStore } from '../../store/useWallConfigStore'

const ENGINEERING_CONSTANTS = [
  'CHB face size: 0.40 m × 0.20 m (12.5 pcs/sqm)',
  'Plaster thickness: 12.7 mm (1/2 inch minimum)',
  'Plaster mix: 1 cement : 2 sand by volume',
  "Gypsum board: 4′ × 8′ panel — 2.973 sqm/board",
  'Joint compound: 0.5 L per linear metre of seam',
  'Paint coverage: 7 sqm/L/coat (adjustable)',
  'Primer: 1 coat. Topcoat: 2 coats (default, adjustable)',
]

export function Step7BOM() {
  const { areaState, rows } = useWallComputation()
  const config = useWallConfigStore((s) => s.config)
  const prevStep = useWallConfigStore((s) => s.prevStep)
  const reset = useWallConfigStore((s) => s.reset)

  const { geometry, openings, sides } = config
  const fmt2 = (n: number) => n.toFixed(2)

  const openingCount = openings.reduce((sum, o) => sum + o.quantity, 0)
  const openingLabel =
    openingCount === 0
      ? 'None'
      : openings.map((o) => `${o.quantity}× ${o.label}`).join(', ')

  const grossLabel = `${fmt2(geometry.lengthM)} m × ${fmt2(geometry.heightM)} m × ${geometry.wallCount} wall${geometry.wallCount !== 1 ? 's' : ''}`

  const handleCopyAsText = () => {
    const header = ['Material', 'Unit', 'Formula Qty', '+Wastage', 'Order Qty'].join('\t')
    const bodyLines = rows.map((row) =>
      [
        row.label,
        row.unit,
        row.theoreticalQty.toFixed(2),
        row.adjustedQty.toFixed(2),
        row.packagingNote,
      ].join('\t')
    )
    navigator.clipboard.writeText([header, ...bodyLines].join('\n'))
  }

  return (
    <div id="bom-content" className="flex flex-col p-4">
      {/* Dark Area Breakdown Card */}
      <div className="bg-[#1A2332] rounded-[10px] p-4 text-white mb-4">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-white/50 mb-3">
          Area Breakdown
        </p>

        {/* Gross area */}
        <div className="flex justify-between items-center text-[13px] mb-1.5">
          <span className="text-white/65">Gross wall area</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-white/40">{grossLabel}</span>
            <span className="font-mono text-[13px] font-medium text-white tabular-nums">
              {fmt2(areaState.grossAreaSqm)} sqm
            </span>
          </div>
        </div>

        {/* Opening deductions */}
        <div className="flex justify-between items-center text-[13px] mb-1.5">
          <span className="text-white/65">Opening deductions</span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-white/40">{openingLabel}</span>
            <span className="font-mono text-[13px] font-medium text-[#F5A623] tabular-nums">
              −{fmt2(areaState.openingAreaSqm)} sqm
            </span>
          </div>
        </div>

        {/* Divider + Net area */}
        <div className="border-t border-white/10 pt-2 mt-0.5">
          <div className="flex justify-between items-center text-[13px] mb-1.5">
            <span className="text-white/65">Net wall area</span>
            <span className="font-mono text-[13px] font-medium text-[#F5A623] tabular-nums">
              {fmt2(areaState.netAreaSqm)} sqm
            </span>
          </div>

          {/* Finish area */}
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-white/65">
              Finish area{sides === 2 ? ' (×2 sides)' : ''}
            </span>
            <span className="font-mono text-[13px] font-medium text-[#F5A623] tabular-nums">
              {fmt2(areaState.finishAreaSqm)} sqm
            </span>
          </div>
        </div>
      </div>

      {/* BOM Table */}
      <div className="border border-[#D4DAE3] rounded-[10px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[#1A2332]">
              <th className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-white/50 px-3.5 py-2.5 text-left">
                Material
              </th>
              <th className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-white/50 px-3.5 py-2.5 text-left">
                Unit
              </th>
              <th className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-white/50 px-3.5 py-2.5 text-right">
                Formula Qty
              </th>
              <th className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-white/50 px-3.5 py-2.5 text-right">
                +Wastage
              </th>
              <th className="font-mono text-[8px] font-medium uppercase tracking-[0.1em] text-white px-3.5 py-2.5 text-right">
                ORDER QTY
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3.5 py-6 text-center text-xs text-[#8896A7]"
                >
                  No layers enabled. Go back and enable at least one layer.
                </td>
              </tr>
            )}
            {rows.map((row, idx) => (
              <tr
                key={row.layerCode}
                className={idx % 2 === 1 ? 'bg-[#fafaf9]' : 'bg-white'}
              >
                <td className="px-3.5 py-[11px] text-left font-medium text-[13px] text-[#1A2332]">
                  {row.label}
                </td>
                <td className="px-3.5 py-[11px] text-left font-mono text-[11px] text-[#8896A7]">
                  {row.unit}
                </td>
                <td className="px-3.5 py-[11px] text-right font-mono text-[12px] text-[#4A5568] tabular-nums">
                  {row.theoreticalQty.toFixed(2)}
                </td>
                <td className="px-3.5 py-[11px] text-right font-mono text-[12px] text-[#4A5568] tabular-nums">
                  {row.adjustedQty.toFixed(2)}
                </td>
                <td className="px-3.5 py-[11px] text-right font-mono text-[13px] font-semibold text-[#1B3FC4] tabular-nums">
                  {row.packagingNote}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions Row */}
      <div className="flex gap-2.5 mt-4 flex-wrap print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-[#1B3FC4] text-white border-none rounded-lg px-[18px] py-[9px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-colors duration-150 ease-out hover:bg-[#1535A8]"
        >
          Print BOM
        </button>
        <button
          type="button"
          onClick={handleCopyAsText}
          className="bg-white text-[#1A2332] border border-[#D4DAE3] rounded-lg px-[18px] py-[9px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-colors duration-150 ease-out hover:bg-[#F8F7F5]"
        >
          Copy as Text
        </button>
        <button
          type="button"
          onClick={reset}
          className="bg-white text-[#1A2332] border border-[#D4DAE3] rounded-lg px-[18px] py-[9px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-colors duration-150 ease-out hover:bg-[#F8F7F5]"
        >
          Reset
        </button>
        <div className="ml-auto print:hidden">
          <button
            type="button"
            onClick={prevStep}
            className="bg-white text-[#1A2332] border border-[#D4DAE3] rounded-lg px-[18px] py-[9px] font-mono text-[10px] font-medium uppercase tracking-[0.08em] transition-colors duration-150 ease-out hover:bg-[#F8F7F5]"
          >
            Back to Edit
          </button>
        </div>
      </div>

      {/* Assumptions Block */}
      <div className="bg-[#F2F0EB] border border-[#D4DAE3] rounded-lg p-4 mt-4">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[#8896A7] mb-2.5">
          Engineering Constants Used
        </p>
        {ENGINEERING_CONSTANTS.map((line) => (
          <p key={line} className="text-[11px] text-[#4A5568] mb-[3px] leading-relaxed">
            {line}
          </p>
        ))}
        <p className="mt-2.5 text-[11px] text-[#8896A7] italic border-t border-[#D4DAE3] pt-2.5">
          Quantities are estimates for procurement planning. Verify with a licensed estimator before issuing a purchase order.
        </p>
      </div>
    </div>
  )
}
