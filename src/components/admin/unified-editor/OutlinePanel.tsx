'use client'

import { useCallback, useMemo } from 'react'
import { EditorView } from '@codemirror/view'
import { Eyebrow } from '@/components/ui/eyebrow'
import type { ParsedHeading, QuestionData, EIPromptData } from './types'

// ─── Props ───────────────────────────────────────────────────

interface OutlinePanelProps {
  headings: ParsedHeading[]
  questions: QuestionData[]
  eiPrompts: EIPromptData[]
  editorViewRef: React.MutableRefObject<any>
  content: string
}

// ─── Helpers ─────────────────────────────────────────────────

const escapeRegex = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Count questions whose text shares a keyword (3+ chars) with the heading */
const countQuestionsForHeading = (
  heading: ParsedHeading,
  questions: QuestionData[]
): number => {
  const words = heading.text
    .split(/\s+/)
    .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
    .filter((w) => w.length >= 3)

  if (words.length === 0) return 0

  return questions.filter((q) => {
    const lower = q.text.toLowerCase()
    return words.some((w) => lower.includes(w))
  }).length
}

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}...` : text

// ─── Component ───────────────────────────────────────────────

export const OutlinePanel = ({
  headings,
  questions,
  eiPrompts,
  editorViewRef,
  content,
}: OutlinePanelProps) => {
  // ── Question counts per heading (memoized) ─────────────────

  const questionCounts = useMemo(
    () =>
      headings.map((h) => ({
        heading: h,
        count: countQuestionsForHeading(h, questions),
      })),
    [headings, questions]
  )

  // ── Scroll editor to heading ───────────────────────────────

  const scrollToHeading = useCallback(
    (heading: ParsedHeading) => {
      const view = editorViewRef.current
      if (!view) return

      const lines = content.split('\n')
      let offset = 0
      for (let i = 0; i < lines.length; i++) {
        const pattern = new RegExp(
          `^#{${heading.level}}\\s+${escapeRegex(heading.text)}`
        )
        if (pattern.test(lines[i])) {
          break
        }
        offset += lines[i].length + 1
      }

      view.dispatch({
        effects: EditorView.scrollIntoView(offset, { y: 'start' }),
      })
      view.focus()
    },
    [editorViewRef, content]
  )

  // ── EI prompts grouped by heading ──────────────────────────

  const eiByHeading = useMemo(() => {
    const map = new Map<string, EIPromptData[]>()
    for (const prompt of eiPrompts) {
      const key = prompt.insert_after_heading || '(no heading)'
      const list = map.get(key) || []
      list.push(prompt)
      map.set(key, list)
    }
    return map
  }, [eiPrompts])

  return (
    <div className="sticky top-0 flex w-[200px] shrink-0 flex-col overflow-y-auto border-r border-border bg-white xl:w-[200px]">
      {/* Header */}
      <div className="px-3 pb-2 pt-4">
        <Eyebrow>Outline</Eyebrow>
      </div>

      {/* Headings list */}
      <nav className="flex-1 pb-2" aria-label="Article outline">
        {headings.length === 0 ? (
          <p className="px-3 py-2 text-[11px] text-text-tertiary">
            No headings found in content.
          </p>
        ) : (
          <ul className="space-y-0.5">
            {questionCounts.map(({ heading, count }, i) => (
              <li key={`${heading.level}-${heading.text}-${i}`}>
                <button
                  type="button"
                  onClick={() => scrollToHeading(heading)}
                  className={`flex w-full items-center gap-1.5 text-left text-xs transition-colors duration-150 ease-out hover:bg-[#F8F7F5] ${heading.level === 3 ? 'pl-7 pr-3 py-1.5' : 'px-3 py-1.5'} group cursor-pointer`}
                  title={heading.text}
                >
                  {/* Section icon */}
                  <span className="shrink-0 text-text-tertiary group-hover:text-camp-cobalt">
                    &sect;
                  </span>

                  {/* Heading text */}
                  <span className="min-w-0 flex-1 truncate text-text-primary group-hover:text-camp-cobalt">
                    {truncate(heading.text, 28)}
                  </span>

                  {/* Question count badge */}
                  <span
                    className={`shrink-0 text-[11px] ${count === 0 ? 'text-warning' : 'text-text-tertiary'}`}
                    title="Approximate — based on keyword matching"
                  >
                    {count}q
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-border" />

      {/* EI Prompts section */}
      <div className="px-3 pb-4 pt-3">
        <div className="mb-2 flex items-center justify-between">
          <Eyebrow>EI Prompts</Eyebrow>
          <span className="rounded-sm bg-[#EEF2FC] px-1.5 py-0.5 text-[11px] font-medium text-camp-cobalt">
            {eiPrompts.length}
          </span>
        </div>

        {eiPrompts.length === 0 ? (
          <p className="text-[11px] text-text-tertiary">No EI prompts yet.</p>
        ) : (
          <ul className="space-y-1">
            {eiPrompts.map((prompt) => (
              <li
                key={prompt.prompt_id}
                className="flex items-start gap-1.5 py-1 text-[11px] text-text-secondary"
              >
                <span className="shrink-0 text-text-tertiary">&sect;</span>
                <span className="min-w-0">
                  <span className="text-text-tertiary">After </span>
                  <span className="font-medium text-text-primary">
                    {truncate(prompt.insert_after_heading || '(none)', 22)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
