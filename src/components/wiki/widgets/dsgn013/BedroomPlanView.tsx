'use client'

export const BedroomPlanView = () => {
  return (
    <div className="not-prose my-5 rounded-[10px] border border-wiki-border overflow-hidden bg-white dark:bg-wiki-ink dark:border-wiki-invert-divider">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-muted border-b border-wiki-border dark:bg-wiki-surface-dark dark:border-wiki-invert-divider">
        <div>
          <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-camp-cobalt">
            Plan View
          </div>
          <div className="text-xs text-ink-muted mt-0.5 dark:text-wiki-muted">
            Queen bed in a 3.5 m × 4.0 m bedroom with clearance zones
          </div>
        </div>
      </div>

      {/* SVG Body */}
      <div className="p-6 overflow-x-auto">
        <svg
          viewBox="0 0 420 480"
          width="420"
          className="block mx-auto max-w-full h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="bp-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0,0,0,.04)" strokeWidth=".5" />
            </pattern>
            <pattern id="bp-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(27,63,196,.08)" strokeWidth="1.5" />
            </pattern>
          </defs>

          {/* Room outline */}
          <rect x="30" y="30" width="350" height="400" fill="url(#bp-grid)" stroke="#1A1A1A" strokeWidth="2" />
          <text x="205" y="22" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="10" fill="#737370">3,500 mm</text>
          <text x="18" y="230" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="10" fill="#737370" transform="rotate(-90 18 230)">4,000 mm</text>

          {/* Door */}
          <rect x="30" y="360" width="90" height="6" fill="white" stroke="#1A1A1A" strokeWidth="1.5" />
          <path d="M120 366 Q120 430 56 430" fill="none" stroke="#737370" strokeWidth="1" strokeDasharray="4 3" />

          {/* Queen bed: 1520×2030 → scaled ~152×203 */}
          <rect x="198" y="50" width="152" height="203" fill="rgba(27,63,196,.08)" stroke="#1B3FC4" strokeWidth="1.5" rx="3" />
          <text x="274" y="155" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="9" fill="#1B3FC4">QUEEN</text>
          <text x="274" y="168" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="8" fill="#1B3FC4" opacity=".6">1,520 × 2,030</text>

          {/* Nightstands */}
          <rect x="198" y="253" width="50" height="40" fill="rgba(245,166,35,.1)" stroke="#D4900C" strokeWidth="1" rx="2" />
          <text x="223" y="277" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="7" fill="#D4900C">NS</text>
          <rect x="300" y="253" width="50" height="40" fill="rgba(245,166,35,.1)" stroke="#D4900C" strokeWidth="1" rx="2" />
          <text x="325" y="277" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="7" fill="#D4900C">NS</text>

          {/* Wardrobe */}
          <rect x="40" y="50" width="60" height="160" fill="rgba(245,166,35,.1)" stroke="#D4900C" strokeWidth="1" rx="2" />
          <text x="70" y="134" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="8" fill="#D4900C">WARDROBE</text>

          {/* Clearance zones (hatched) */}
          <rect x="108" y="50" width="90" height="203" fill="url(#bp-hatch)" rx="2" />
          <text x="153" y="155" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="8" fill="#1B3FC4" opacity=".7">900</text>

          <rect x="198" y="293" width="152" height="60" fill="url(#bp-hatch)" rx="2" />
          <text x="274" y="327" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="8" fill="#1B3FC4" opacity=".7">600</text>

          <rect x="40" y="210" width="60" height="100" fill="url(#bp-hatch)" rx="2" />
          <text x="70" y="264" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="8" fill="#1B3FC4" opacity=".7">1,000</text>

          {/* Dimension line */}
          <line x1="108" y1="440" x2="198" y2="440" stroke="#1B3FC4" strokeWidth="1" />
          <line x1="108" y1="435" x2="108" y2="445" stroke="#1B3FC4" strokeWidth="1" />
          <line x1="198" y1="435" x2="198" y2="445" stroke="#1B3FC4" strokeWidth="1" />
          <text x="153" y="456" textAnchor="middle" fontFamily="var(--font-dm-mono), monospace" fontSize="9" fill="#1B3FC4">900 mm</text>

          {/* Legend */}
          <rect x="40" y="400" width="12" height="12" fill="rgba(27,63,196,.08)" stroke="#1B3FC4" strokeWidth="1" />
          <text x="58" y="410" fontFamily="var(--font-dm-mono), monospace" fontSize="8" fill="#737370">Furniture</text>
          <rect x="140" y="400" width="12" height="12" fill="url(#bp-hatch)" />
          <text x="158" y="410" fontFamily="var(--font-dm-mono), monospace" fontSize="8" fill="#737370">Clearance zone</text>
        </svg>
      </div>
    </div>
  )
}
