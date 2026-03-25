'use client'

import { Eyebrow } from '@/components/ui/eyebrow'

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
  <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b border-border bg-[#F8F7F5]/60">
    <Eyebrow className="self-center mr-1">Components</Eyebrow>
    {TOOLBAR_ITEMS.map(item => (
      <button
        key={item.label}
        type="button"
        onMouseDown={e => {
          // prevent stealing editor focus
          e.preventDefault()
          onInsert(item.tag)
        }}
        className="text-[11px] px-2 py-1 rounded-sm border border-border bg-white text-text-secondary hover:bg-[#EEF2FC] hover:text-camp-cobalt hover:border-camp-cobalt/40 transition-colors duration-150"
      >
        {item.label}
      </button>
    ))}
  </div>
)
