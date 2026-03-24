'use client'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComponentToolbarProps {
  onInsert: (tag: string) => void
}

// ---------------------------------------------------------------------------
// Button definitions
// ---------------------------------------------------------------------------

const TOOLBAR_ITEMS: { label: string; tag: string }[] = [
  { label: 'Note', tag: '<Note>\n\n</Note>' },
  { label: 'Comparison', tag: '<ComparisonTable items={[]} />' },
  { label: 'Key Values', tag: '<KeyValues items={[]} />' },
  { label: 'Formula', tag: '<FormulaBlock label="" steps={[]} />' },
  { label: 'Quiz', tag: '<InlineQuiz question="" options={[]} correct={0} explanation="" />' },
  { label: 'EI Prompt', tag: '<ElaborativeInterrogation prompt="" />' },
  { label: 'Callout', tag: '<Callout type="info">\n\n</Callout>' },
]

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const ComponentToolbar = ({ onInsert }: ComponentToolbarProps) => (
  <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-[#D4DAE3] bg-[#F8F7F5]/60">
    <span
      className="self-center text-[11px] font-medium uppercase tracking-widest text-[#8896A7] mr-1"
      style={{ fontFamily: 'var(--font-dm-mono), monospace' }}
    >
      Components
    </span>
    {TOOLBAR_ITEMS.map(item => (
      <button
        key={item.label}
        type="button"
        onMouseDown={e => {
          // prevent stealing editor focus
          e.preventDefault()
          onInsert(item.tag)
        }}
        className="text-[11px] px-2 py-1 rounded-sm border border-[#D4DAE3] bg-white text-[#4A5568] hover:bg-[#EEF2FC] hover:text-[#1B3FC4] hover:border-[#1B3FC4]/40 transition-colors duration-150"
      >
        {item.label}
      </button>
    ))}
  </div>
)
