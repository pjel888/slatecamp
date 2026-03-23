'use client'

interface LabTopBarProps {
  title: string
  codeReference: string
  visitedCount: number
  totalCount: number
  onBack: () => void
}

export const LabTopBar = ({
  title,
  codeReference,
  visitedCount,
  totalCount,
  onBack,
}: LabTopBarProps) => {
  return (
    <div
      className="flex items-center justify-between px-4 shrink-0"
      style={{
        height: '36px',
        backgroundColor: '#0F1F5C',
      }}
    >
      {/* Left: Back link */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 transition-colors duration-150 ease-out cursor-pointer bg-transparent border-0 p-0"
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.4)',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color =
            'rgba(255,255,255,0.7)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.color =
            'rgba(255,255,255,0.4)'
        }}
      >
        ← Back
      </button>

      {/* Center: Module title + code reference */}
      <div className="flex items-center gap-2">
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: 500,
          }}
        >
          {title}
        </span>
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
            fontWeight: 500,
          }}
        >
          {codeReference}
        </span>
      </div>

      {/* Right: Hotspot progress */}
      <span
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.3)',
        }}
      >
        {visitedCount} of {totalCount} hotspots
      </span>
    </div>
  )
}
