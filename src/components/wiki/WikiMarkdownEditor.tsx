'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const proseClasses =
  'prose prose-sm prose-neutral dark:prose-invert max-w-none text-[13px] [&_table]:text-xs [&_th]:text-left [&_th]:font-medium [&_td]:py-1.5 [&_th]:py-1.5 [&_table]:border-collapse [&_td]:border [&_th]:border [&_td]:border-border/40 [&_th]:border-border/40 [&_td]:px-3 [&_th]:px-3 [&_h2]:text-base [&_h3]:text-sm [&_h2]:font-semibold [&_h3]:font-medium'

interface WikiMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
  className?: string
}

export function WikiMarkdownEditor({
  value,
  onChange,
  placeholder = 'Write markdown...',
  minHeight = '200px',
  className = '',
}: WikiMarkdownEditorProps) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')

  return (
    <div className={className}>
      <div className="mb-1.5 flex gap-1 border-b border-border/40 pb-1.5">
        <button
          type="button"
          onClick={() => setMode('edit')}
          className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
            mode === 'edit'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setMode('preview')}
          className={`rounded px-2 py-1 text-[11px] font-medium transition-colors ${
            mode === 'preview'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Preview
        </button>
      </div>
      {mode === 'edit' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          style={{ minHeight }}
          spellCheck={false}
        />
      ) : (
        <div
          className={`rounded-lg border border-border bg-muted/30 px-3 py-2 overflow-y-auto ${proseClasses}`}
          style={{ minHeight }}
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground text-[13px]">{placeholder}</p>
          )}
        </div>
      )}
    </div>
  )
}
