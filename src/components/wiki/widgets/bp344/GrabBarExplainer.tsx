'use client'

import * as React from 'react'

export const GrabBarExplainer = () => {
  const [offset, setOffset] = React.useState(300)
  const ok = offset === 300
  const bc = ok ? '#1B7A3C' : '#E63329'
  const sc = 0.22, fY = 280, sH = 450 * sc, sY = fY - sH, bH = (450 + offset) * sc, bY = fY - bH
  const ox = 60, wcW = 44, wcX = ox + 28, floorToBar = 450 + offset

  return (
    <div className="not-prose my-5 rounded-lg border border-[#d0cec7] bg-[#F8F7F5] px-6 py-5">
      <div className="font-dm-mono text-[11px] uppercase tracking-[0.08em] text-[#1B3FC4] mb-2">Interactive — Grab Bar Reference Points (2024 IRR)</div>
      <p className="text-[13px] text-[#444] mb-2.5">The 2024 IRR specifies grab bar height from two reference points simultaneously. Move the slider — only 300 mm above seat is compliant.</p>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <label className="text-[12px] text-[#555]">Grab bar height above seat (mm):</label>
        <input
          type="range"
          min={250}
          max={350}
          value={offset}
          onChange={e => setOffset(parseInt(e.target.value))}
          className="w-40 accent-[#1B3FC4]"
        />
        <span className="font-dm-mono text-[13px] text-[#1B3FC4] min-w-[50px]">{offset} mm</span>
      </div>
      <svg width="100%" viewBox="0 0 380 320" className="max-w-[380px] block mx-auto" role="img" aria-labelledby="grabbar-viz-title">
        <title id="grabbar-viz-title">Grab bar height visualization — {ok ? 'compliant at 300mm above seat' : `non-compliant at ${offset}mm above seat`}</title>
        <line x1="30" y1={fY} x2="340" y2={fY} stroke="#888" strokeWidth="2" />
        <text x="34" y={fY + 12} fontSize="9" fill="#888">Finished floor (0 mm)</text>
        <line x1={ox} y1="20" x2={ox} y2={fY} stroke="#bbb" strokeWidth="8" strokeLinecap="round" />
        <rect x={wcX} y={sY} width={wcW} height={Math.round(sH * 0.62)} fill="#e8e6e0" stroke="#999" strokeWidth="1" rx="4" />
        <ellipse cx={wcX + wcW / 2} cy={sY} rx={wcW / 2} ry="6" fill="#d0cec7" stroke="#aaa" strokeWidth="1" />
        <line x1={wcX + wcW + 8} y1={fY} x2={wcX + wcW + 8} y2={sY} stroke="#1B3FC4" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x={wcX + wcW + 12} y={fY - Math.round(sH / 2)} fontSize="9" fill="#1B3FC4" dominantBaseline="central">450mm (seat)</text>
        <rect x={ox - 10} y={bY - 5} width="52" height="10" fill={bc} rx="5" opacity="0.9" />
        <line x1={ox - 18} y1={fY} x2={ox - 18} y2={bY} stroke={bc} strokeWidth="1.5" strokeDasharray="4 2" />
        <text x={ox - 22} y={Math.round((fY + bY) / 2)} fontSize="9" fill={bc} textAnchor="end" dominantBaseline="central">{floorToBar}mm</text>
        <text x={ox - 22} y={Math.round((fY + bY) / 2) + 12} fontSize="8" fill={bc} textAnchor="end" dominantBaseline="central">from floor</text>
        <line x1={ox + 52} y1={sY} x2={ox + 52} y2={bY} stroke="#E8853A" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x={ox + 66} y={Math.round((sY + bY) / 2)} fontSize="9" fill="#E8853A" dominantBaseline="central">{offset}mm</text>
        <text x={ox + 66} y={Math.round((sY + bY) / 2) + 12} fontSize="8" fill="#E8853A" dominantBaseline="central">above seat</text>
        <rect x="30" y={fY + 22} width="320" height="26" rx="5" fill={ok ? '#e8f5ee' : '#fdf0ef'} stroke={bc} strokeWidth="0.8" />
        <text x="190" y={fY + 38} fontSize="10" fill={bc} textAnchor="middle" dominantBaseline="central">
          {ok ? '✓ 2024 compliant — 300mm above seat, ~750mm above floor' : '✗ Non-compliant — 2024 IRR requires exactly 300mm above seat'}
        </text>
      </svg>
    </div>
  )
}
