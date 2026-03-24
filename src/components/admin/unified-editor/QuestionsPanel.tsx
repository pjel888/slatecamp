'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useDirtyState } from './DirtyStateProvider'
import type {
  QuestionData,
  EIPromptData,
  TaxonomyNodeInfo,
  TaxonomyLink,
  ParsedHeading,
  QuestionDraft,
} from './types'

// ─── Lazy-loaded sub-panel ──────────────────────────────────
// EIPromptsPanel is a sibling component rendered inside the second tab
import { EIPromptsPanel } from './EIPromptsPanel'

// ─── Props ──────────────────────────────────────────────────

interface QuestionsPanelProps {
  questions: QuestionData[]
  eiPrompts: EIPromptData[]
  taxonomyNodes: TaxonomyNodeInfo[]
  taxonomyLinks: TaxonomyLink[]
  headings: ParsedHeading[]
  articleId: string
  primaryNodeId: string | null
  onQuestionUpdate: (questionId: string, data: Partial<QuestionData>) => void
  onEIPromptUpdate: (promptId: string, data: Partial<EIPromptData>) => void
}

// ─── Filter types ───────────────────────────────────────────

type RationaleFilter = 'all' | 'has' | 'missing'
type CitationFilter = 'all' | 'has' | 'missing'

// ─── Helpers ────────────────────────────────────────────────

const truncate = (text: string, max: number): string =>
  text.length > max ? text.slice(0, max).trimEnd() + '...' : text

const formatTimestamp = (ts: string | null | undefined): string => {
  if (!ts) return 'N/A'
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return ts
  }
}

const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  return /^https?:\/\/.+\.(png|jpe?g|gif|webp|svg|avif)/i.test(url)
}

// ─── Difficulty Bar ─────────────────────────────────────────

const DifficultyBar = ({ value }: { value: number | null }) => {
  const difficulty = value ?? 0
  const filled = Math.round(difficulty * 5)

  return (
    <div className="flex items-center gap-0.5" title={`Difficulty: ${difficulty.toFixed(2)}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`h-2.5 w-1.5 rounded-[1px] ${
            i < filled ? 'bg-[#D4951A]' : 'bg-[#D4DAE3]'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Toggle Button Group ────────────────────────────────────

const ToggleGroup = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (v: any) => void
  options: { value: string; label: string }[]
}) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs text-[#8896A7]">{label}:</span>
    <div className="flex rounded-sm border border-[#D4DAE3]">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-2 py-0.5 text-[11px] font-medium transition-colors duration-150 ease-out first:rounded-l-sm last:rounded-r-sm ${
            value === opt.value
              ? 'bg-[#EEF2FC] text-[#1B3FC4]'
              : 'bg-white text-[#8896A7] hover:text-[#4A5568]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
)

// ─── Auto-growing Textarea ──────────────────────────────────

const AutoTextarea = ({
  value,
  onChange,
  placeholder,
  className = '',
  minRows = 2,
}: {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  className?: string
  minRows?: number
}) => {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={minRows}
      className={`w-full resize-none border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out ${className}`}
    />
  )
}

// ─── Collapsible Section ────────────────────────────────────

const CollapsibleSection = ({
  title,
  defaultOpen = false,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) => {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-[#D4DAE3]">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors duration-150 ease-out hover:bg-[#F8F7F5]"
      >
        <svg
          className={`h-3 w-3 shrink-0 text-[#8896A7] transition-transform duration-150 ease-out ${
            open ? 'rotate-90' : ''
          }`}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-mono text-[11px] uppercase tracking-widest text-[#8896A7]">
          {title}
        </span>
      </button>
      {open && <div className="px-3 pb-3 pt-1">{children}</div>}
    </div>
  )
}

// ─── Copyable Field ─────────────────────────────────────────

const CopyableField = ({ label, value }: { label: string; value: string | null }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!value) return
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [value])

  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-[#8896A7]">{label}:</span>
      <div className="flex items-center gap-1">
        <span className="max-w-[200px] truncate font-mono text-[11px] text-[#4A5568]">
          {value || 'N/A'}
        </span>
        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-sm p-0.5 text-[#8896A7] transition-colors duration-150 ease-out hover:text-[#4A5568]"
            title="Copy"
          >
            {copied ? (
              <svg className="h-3 w-3 text-[#2D9F6F]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M3 8.5l3 3 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="5" y="5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                <path d="M3 11V3a1 1 0 011-1h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Expanded Question Card ─────────────────────────────────

interface QuestionCardExpandedProps {
  question: QuestionData
  nodeAleId: string | null
  nodeName: string | null
  onUpdate: (data: Partial<QuestionData>) => void
  onDelete: () => void
}

const QuestionCardExpanded = ({
  question,
  nodeAleId,
  nodeName,
  onUpdate,
  onDelete,
}: QuestionCardExpandedProps) => {
  const handleOptionTextChange = useCallback(
    (optionId: string, text: string) => {
      const updated = question.options.map((o) =>
        o.id === optionId ? { ...o, text } : o
      )
      onUpdate({ options: updated })
    },
    [question.options, onUpdate]
  )

  const handleCorrectChange = useCallback(
    (optionId: string) => {
      onUpdate({ correct_option_id: optionId })
    },
    [onUpdate]
  )

  const handlePracticeContextChange = useCallback(
    (val: string) => {
      const tags = val
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      onUpdate({ practice_context: tags })
    },
    [onUpdate]
  )

  const rationaleLength = (question.rationale || '').length

  return (
    <div className="space-y-0">
      {/* ── CORE (always open) ─────────────────────────────── */}
      <CollapsibleSection title="Core" defaultOpen>
        <div className="space-y-3">
          {/* Question stem */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Question stem
            </label>
            <AutoTextarea
              value={question.text}
              onChange={(val) => onUpdate({ text: val })}
              placeholder="Enter the question stem..."
              minRows={3}
            />
          </div>

          {/* Options A-D with radio */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Answer options
            </label>
            <div className="space-y-2">
              {question.options.map((opt) => (
                <div key={opt.id} className="flex items-start gap-2">
                  <label className="flex cursor-pointer items-center gap-1.5 pt-1.5">
                    <input
                      type="radio"
                      name={`correct-${question.question_id}`}
                      checked={question.correct_option_id === opt.id}
                      onChange={() => handleCorrectChange(opt.id)}
                      className="h-3.5 w-3.5 accent-[#2D9F6F]"
                    />
                    <span className="font-mono text-[11px] font-semibold text-[#4A5568]">
                      {opt.id}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                    placeholder={`Option ${opt.id}...`}
                    className="min-w-0 flex-1 border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Rationale */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Rationale
            </label>
            <AutoTextarea
              value={question.rationale || ''}
              onChange={(val) => onUpdate({ rationale: val })}
              placeholder="Explain why the correct answer is correct..."
              minRows={2}
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] text-[#8896A7]">
                {rationaleLength} character{rationaleLength !== 1 ? 's' : ''}
              </span>
              {rationaleLength > 0 && rationaleLength < 50 && (
                <span className="flex items-center gap-1 text-[11px] text-[#D4951A]">
                  <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 5v3m0 2.5h.01M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Short rationale (consider expanding)
                </span>
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── DETAILS (collapsed by default) ─────────────────── */}
      <CollapsibleSection title="Details">
        <div className="space-y-3">
          {/* Explanation */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Extended explanation (optional)
            </label>
            <AutoTextarea
              value={question.explanation || ''}
              onChange={(val) => onUpdate({ explanation: val })}
              placeholder="Additional context or teaching notes..."
              minRows={2}
            />
          </div>

          {/* Code citation */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Code citation
            </label>
            <input
              type="text"
              value={question.code_citation || ''}
              onChange={(e) => onUpdate({ code_citation: e.target.value })}
              placeholder="BP 344 &sect;C.6.3.a"
              className="w-full border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Difficulty (0.00 - 1.00)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={question.difficulty ?? 0.5}
                onChange={(e) =>
                  onUpdate({ difficulty: parseFloat(e.target.value) || 0 })
                }
                className="w-24 border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
              />
              <DifficultyBar value={question.difficulty} />
            </div>
          </div>

          {/* Is assessment */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={question.is_assessment}
              onChange={(e) => onUpdate({ is_assessment: e.target.checked })}
              className="h-3.5 w-3.5 rounded-sm accent-[#1B3FC4]"
            />
            <span className="text-xs font-medium text-[#4A5568]">
              Diagnostic only
            </span>
          </label>

          {/* Application context */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Real-world scenario
            </label>
            <input
              type="text"
              value={question.application_context || ''}
              onChange={(e) => onUpdate({ application_context: e.target.value })}
              placeholder="How this applies in practice..."
              className="w-full border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
            />
          </div>

          {/* Practice context tags */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Practice context (comma-separated tags)
            </label>
            <input
              type="text"
              value={(question.practice_context || []).join(', ')}
              onChange={(e) => handlePracticeContextChange(e.target.value)}
              placeholder="residential, commercial, seismic"
              className="w-full border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
            />
          </div>

          {/* Prompt image URL */}
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Prompt image URL
            </label>
            <input
              type="text"
              value={question.prompt_image_url || ''}
              onChange={(e) => onUpdate({ prompt_image_url: e.target.value })}
              placeholder="https://..."
              className="w-full border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
            />
            {isValidImageUrl(question.prompt_image_url) && (
              <div className="mt-2 overflow-hidden rounded-sm border border-[#D4DAE3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={question.prompt_image_url!}
                  alt="Question prompt"
                  className="h-24 w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>

      {/* ── METADATA (collapsed, read-only) ────────────────── */}
      <CollapsibleSection title="Metadata">
        <div className="space-y-2">
          <CopyableField label="question_id" value={question.question_id} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#8896A7]">topic_id:</span>
            <span className="font-mono text-[11px] text-[#4A5568]">
              {nodeAleId || question.topic_id}
              {nodeName && (
                <span className="ml-1 font-sans text-[#8896A7]">({nodeName})</span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#8896A7]">model_id:</span>
            <span className="font-mono text-[11px] text-[#4A5568]">
              {question.model_id || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#8896A7]">difficulty_rating (IRT):</span>
            <span className="font-mono text-[11px] text-[#4A5568]">
              {question.difficulty_rating != null
                ? question.difficulty_rating.toFixed(3)
                : 'Not yet computed'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#8896A7]">discrimination_rating (IRT):</span>
            <span className="font-mono text-[11px] text-[#4A5568]">
              {question.discrimination_rating != null
                ? question.discrimination_rating.toFixed(3)
                : 'Not yet computed'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#8896A7]">created_at:</span>
            <span className="text-[11px] text-[#4A5568]">
              {formatTimestamp(question.created_at)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-[#8896A7]">updated_at:</span>
            <span className="text-[11px] text-[#4A5568]">
              {formatTimestamp(question.updated_at)}
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* ── Delete action ──────────────────────────────────── */}
      <div className="border-t border-[#D4DAE3] px-3 py-2">
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-[#D64545] transition-colors duration-150 ease-out hover:text-[#b33a3a]"
        >
          Delete question
        </button>
      </div>
    </div>
  )
}

// ─── New Question Draft Card ────────────────────────────────

interface DraftQuestionCardProps {
  draft: QuestionDraft
  index: number
  isExpanded: boolean
  onExpand: () => void
  onRemove: () => void
}

const DraftQuestionCard = ({
  draft,
  index,
  isExpanded,
  onExpand,
  onRemove,
}: DraftQuestionCardProps) => {
  const dirty = useDirtyState()

  const handleUpdate = useCallback(
    (update: Partial<QuestionDraft>) => {
      dirty.updateNewQuestion(draft._tempId, update)
    },
    [dirty, draft._tempId]
  )

  const handleOptionTextChange = useCallback(
    (optionId: string, text: string) => {
      const updated = draft.options.map((o) =>
        o.id === optionId ? { ...o, text } : o
      )
      handleUpdate({ options: updated })
    },
    [draft.options, handleUpdate]
  )

  const handlePracticeContextChange = useCallback(
    (val: string) => {
      const tags = val
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
      handleUpdate({ practice_context: tags })
    },
    [handleUpdate]
  )

  const rationaleLength = draft.rationale.length

  if (!isExpanded) {
    return (
      <div
        className="group cursor-pointer border border-[#1B3FC4] rounded-md bg-[#EEF2FC] transition-shadow duration-150 ease-out hover:shadow-sm"
        onClick={onExpand}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onExpand()
          }
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1B3FC4] text-[9px] font-bold text-white">
            N
          </span>
          <DifficultyBar value={draft.difficulty} />
          <span className="font-mono text-[11px] text-[#1B3FC4]">NEW</span>
          <span className="min-w-0 flex-1 truncate text-sm text-[#1A2332]">
            {draft.text ? truncate(draft.text, 120) : 'New question (untitled)'}
          </span>
          <span className="shrink-0 text-xs text-[#1B3FC4]">Edit &#9662;</span>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden border border-[#1B3FC4] rounded-md bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4DAE3] bg-[#EEF2FC] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1B3FC4] text-[9px] font-bold text-white">
            N
          </span>
          <span className="text-xs font-semibold text-[#1B3FC4]">New Question</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-[#D64545] transition-colors duration-150 ease-out hover:text-[#b33a3a]"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={onExpand}
            className="text-xs text-[#4A5568] transition-colors duration-150 ease-out hover:text-[#1A2332]"
          >
            Collapse &#9652;
          </button>
        </div>
      </div>

      {/* Core fields */}
      <div className="space-y-3 px-3 py-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#4A5568]">
            Question stem
          </label>
          <AutoTextarea
            value={draft.text}
            onChange={(val) => handleUpdate({ text: val })}
            placeholder="Enter the question stem..."
            minRows={3}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#4A5568]">
            Answer options
          </label>
          <div className="space-y-2">
            {draft.options.map((opt) => (
              <div key={opt.id} className="flex items-start gap-2">
                <label className="flex cursor-pointer items-center gap-1.5 pt-1.5">
                  <input
                    type="radio"
                    name={`correct-draft-${draft._tempId}`}
                    checked={draft.correct_option_id === opt.id}
                    onChange={() => handleUpdate({ correct_option_id: opt.id })}
                    className="h-3.5 w-3.5 accent-[#2D9F6F]"
                  />
                  <span className="font-mono text-[11px] font-semibold text-[#4A5568]">
                    {opt.id}
                  </span>
                </label>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                  placeholder={`Option ${opt.id}...`}
                  className="min-w-0 flex-1 border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[#4A5568]">
            Rationale
          </label>
          <AutoTextarea
            value={draft.rationale}
            onChange={(val) => handleUpdate({ rationale: val })}
            placeholder="Explain why the correct answer is correct..."
            minRows={2}
          />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-[11px] text-[#8896A7]">
              {rationaleLength} character{rationaleLength !== 1 ? 's' : ''}
            </span>
            {rationaleLength > 0 && rationaleLength < 50 && (
              <span className="flex items-center gap-1 text-[11px] text-[#D4951A]">
                <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M8 5v3m0 2.5h.01M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Short rationale (consider expanding)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details section */}
      <CollapsibleSection title="Details">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Extended explanation (optional)
            </label>
            <AutoTextarea
              value={draft.explanation}
              onChange={(val) => handleUpdate({ explanation: val })}
              placeholder="Additional context..."
              minRows={2}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Code citation
            </label>
            <input
              type="text"
              value={draft.code_citation}
              onChange={(e) => handleUpdate({ code_citation: e.target.value })}
              placeholder="BP 344 &sect;C.6.3.a"
              className="w-full border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Difficulty (0.00 - 1.00)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={0}
                max={1}
                step={0.05}
                value={draft.difficulty}
                onChange={(e) =>
                  handleUpdate({ difficulty: parseFloat(e.target.value) || 0 })
                }
                className="w-24 border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
              />
              <DifficultyBar value={draft.difficulty} />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={draft.is_assessment}
              onChange={(e) => handleUpdate({ is_assessment: e.target.checked })}
              className="h-3.5 w-3.5 rounded-sm accent-[#1B3FC4]"
            />
            <span className="text-xs font-medium text-[#4A5568]">
              Diagnostic only
            </span>
          </label>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Real-world scenario
            </label>
            <input
              type="text"
              value={draft.application_context}
              onChange={(e) => handleUpdate({ application_context: e.target.value })}
              placeholder="How this applies in practice..."
              className="w-full border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Practice context (comma-separated tags)
            </label>
            <input
              type="text"
              value={draft.practice_context.join(', ')}
              onChange={(e) => handlePracticeContextChange(e.target.value)}
              placeholder="residential, commercial, seismic"
              className="w-full border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-[#4A5568]">
              Prompt image URL
            </label>
            <input
              type="text"
              value={draft.prompt_image_url}
              onChange={(e) => handleUpdate({ prompt_image_url: e.target.value })}
              placeholder="https://..."
              className="w-full border border-[#D4DAE3] rounded-sm px-2.5 py-1.5 text-sm bg-white text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
            />
            {isValidImageUrl(draft.prompt_image_url) && (
              <div className="mt-2 overflow-hidden rounded-sm border border-[#D4DAE3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={draft.prompt_image_url}
                  alt="Question prompt"
                  className="h-24 w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}

// ─── Question Card (Collapsed or Expanded) ──────────────────

interface QuestionCardProps {
  question: QuestionData
  taxonomyNodes: TaxonomyNodeInfo[]
  isExpanded: boolean
  onToggle: () => void
  isDirty: boolean
  isDeleted: boolean
  onUpdate: (data: Partial<QuestionData>) => void
  onDelete: () => void
  onUndoDelete: () => void
}

const QuestionCard = ({
  question,
  taxonomyNodes,
  isExpanded,
  onToggle,
  isDirty,
  isDeleted,
  onUpdate,
  onDelete,
  onUndoDelete,
}: QuestionCardProps) => {
  const node = taxonomyNodes.find((n) => n.node_id === question.topic_id)
  const aleId = node?.ale_id || null
  const nodeName = node?.name || null
  const hasCitation = Boolean(question.code_citation)
  const hasRationale = Boolean(question.rationale)

  // ── Deleted state ──────────────────────────────────────────
  if (isDeleted) {
    return (
      <div className="border border-[#D64545] rounded-md bg-[#FDF0F0]">
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#D64545]">Delete on next save</span>
            <span className="min-w-0 truncate text-sm text-[#D64545]/70">
              {truncate(question.text, 80)}
            </span>
          </div>
          <button
            type="button"
            onClick={onUndoDelete}
            className="shrink-0 rounded-sm border border-[#D64545]/30 bg-white px-2.5 py-1 text-xs font-medium text-[#D64545] transition-colors duration-150 ease-out hover:bg-[#FDF0F0]"
          >
            Undo
          </button>
        </div>
      </div>
    )
  }

  // ── Collapsed state ────────────────────────────────────────
  if (!isExpanded) {
    return (
      <div
        className="group cursor-pointer border border-[#D4DAE3] rounded-md bg-white transition-shadow duration-150 ease-out hover:shadow-sm"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggle()
          }
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2.5">
          {/* Dirty indicator */}
          {isDirty && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#D4951A]" title="Unsaved changes" />
          )}

          <DifficultyBar value={question.difficulty} />

          {aleId && (
            <span className="font-mono text-[11px] text-[#8896A7]">{aleId}</span>
          )}

          {hasCitation && (
            <span className="text-[11px] text-[#2D9F6F]">Has citation</span>
          )}

          {!hasRationale && (
            <svg
              className="h-3.5 w-3.5 shrink-0 text-[#D4951A]"
              viewBox="0 0 16 16"
              fill="none"
              role="img"
              aria-label="Missing rationale"
            >
              <path
                d="M8 5v3m0 2.5h.01M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          <span className="min-w-0 flex-1 truncate text-sm text-[#1A2332]">
            {truncate(question.text, 120)}
          </span>

          <span className="shrink-0 text-xs text-[#1B3FC4] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100">
            Edit &#9662;
          </span>
        </div>
      </div>
    )
  }

  // ── Expanded state ─────────────────────────────────────────
  return (
    <div className="overflow-hidden border border-[#D4DAE3] rounded-md bg-white">
      {/* Collapse header */}
      <div className="flex items-center justify-between border-b border-[#D4DAE3] bg-[#F8F7F5] px-3 py-2">
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#D4951A]" title="Unsaved changes" />
          )}
          <DifficultyBar value={question.difficulty} />
          {aleId && (
            <span className="font-mono text-[11px] text-[#8896A7]">{aleId}</span>
          )}
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="text-xs text-[#4A5568] transition-colors duration-150 ease-out hover:text-[#1A2332]"
        >
          Collapse &#9652;
        </button>
      </div>

      <QuestionCardExpanded
        question={question}
        nodeAleId={aleId}
        nodeName={nodeName}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  )
}

// ─── Taxonomy Group ─────────────────────────────────────────

interface TaxonomyGroupProps {
  node: TaxonomyNodeInfo
  questions: QuestionData[]
  taxonomyNodes: TaxonomyNodeInfo[]
  expandedId: string | null
  onToggleExpand: (id: string) => void
  onQuestionUpdate: (questionId: string, data: Partial<QuestionData>) => void
}

const TaxonomyGroup = ({
  node,
  questions,
  taxonomyNodes,
  expandedId,
  onToggleExpand,
  onQuestionUpdate,
}: TaxonomyGroupProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const dirty = useDirtyState()

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed((p) => !p)}
        className="flex w-full items-center gap-2 py-2 text-left"
      >
        <svg
          className={`h-3 w-3 shrink-0 text-[#8896A7] transition-transform duration-150 ease-out ${
            collapsed ? '' : 'rotate-90'
          }`}
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-mono text-[11px] text-[#8896A7]">
          {node.ale_id || node.node_id.slice(0, 12)}
        </span>
        <span className="text-xs font-medium text-[#4A5568]">&mdash; {node.name}</span>
        <span className="text-[11px] text-[#8896A7]">
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-2 pb-3 pl-5">
          {questions.map((q) => (
            <QuestionCard
              key={q.question_id}
              question={q}
              taxonomyNodes={taxonomyNodes}
              isExpanded={expandedId === q.question_id}
              onToggle={() =>
                onToggleExpand(
                  expandedId === q.question_id ? '' : q.question_id
                )
              }
              isDirty={dirty.questionsDirty.get(q.question_id) ?? false}
              isDeleted={dirty.deletedQuestions.has(q.question_id)}
              onUpdate={(data) => onQuestionUpdate(q.question_id, data)}
              onDelete={() => dirty.queueDeleteQuestion(q.question_id)}
              onUndoDelete={() => dirty.undoDeleteQuestion(q.question_id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────

export const QuestionsPanel = ({
  questions,
  eiPrompts,
  taxonomyNodes,
  taxonomyLinks,
  headings,
  articleId,
  primaryNodeId,
  onQuestionUpdate,
  onEIPromptUpdate,
}: QuestionsPanelProps) => {
  const dirty = useDirtyState()

  // ── Accordion: only one expanded at a time ────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedDraftId, setExpandedDraftId] = useState<string | null>(null)

  // ── Filter state ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [rationaleFilter, setRationaleFilter] = useState<RationaleFilter>('all')
  const [citationFilter, setCitationFilter] = useState<CitationFilter>('all')

  // ── Build node lookup ─────────────────────────────────────
  const nodeMap = useMemo(() => {
    const map = new Map<string, TaxonomyNodeInfo>()
    for (const node of taxonomyNodes) {
      map.set(node.node_id, node)
    }
    return map
  }, [taxonomyNodes])

  // ── Whether we have multiple taxonomy nodes ───────────────
  const linkedNodeIds = useMemo(
    () => taxonomyLinks.map((l) => l.node_id),
    [taxonomyLinks]
  )
  const hasMultipleNodes = linkedNodeIds.length > 1

  // ── Filter questions ──────────────────────────────────────
  const filteredQuestions = useMemo(() => {
    let result = questions

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((question) =>
        question.text.toLowerCase().includes(q)
      )
    }

    // Rationale filter
    if (rationaleFilter === 'has') {
      result = result.filter((question) => Boolean(question.rationale))
    } else if (rationaleFilter === 'missing') {
      result = result.filter((question) => !question.rationale)
    }

    // Citation filter
    if (citationFilter === 'has') {
      result = result.filter((question) => Boolean(question.code_citation))
    } else if (citationFilter === 'missing') {
      result = result.filter((question) => !question.code_citation)
    }

    return result
  }, [questions, searchQuery, rationaleFilter, citationFilter])

  // ── Group by taxonomy node (when multiple nodes) ──────────
  const groupedQuestions = useMemo(() => {
    if (!hasMultipleNodes) return null

    const groups: { node: TaxonomyNodeInfo; questions: QuestionData[] }[] = []

    for (const nodeId of linkedNodeIds) {
      const node = nodeMap.get(nodeId)
      if (!node) continue
      const nodeQuestions = filteredQuestions.filter(
        (q) => q.topic_id === nodeId
      )
      if (nodeQuestions.length > 0) {
        groups.push({ node, questions: nodeQuestions })
      }
    }

    // Add ungrouped questions (topic_id not in linked nodes)
    const linkedSet = new Set(linkedNodeIds)
    const ungrouped = filteredQuestions.filter(
      (q) => !linkedSet.has(q.topic_id)
    )
    if (ungrouped.length > 0) {
      groups.push({
        node: {
          node_id: '__ungrouped__',
          name: 'Other',
          ale_id: null,
          level: 0,
          parent_id: null,
          subject_area: '',
        },
        questions: ungrouped,
      })
    }

    return groups
  }, [hasMultipleNodes, linkedNodeIds, nodeMap, filteredQuestions])

  // ── Create new question ───────────────────────────────────
  const handleAddQuestion = useCallback(() => {
    const newDraft: QuestionDraft = {
      _tempId: crypto.randomUUID(),
      topic_id: primaryNodeId || '',
      text: '',
      options: [
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ],
      correct_option_id: 'A',
      rationale: '',
      explanation: '',
      code_citation: '',
      difficulty: 0.5,
      is_assessment: false,
      application_context: '',
      practice_context: [],
      prompt_image_url: '',
    }
    dirty.addNewQuestion(newDraft)
    setExpandedDraftId(newDraft._tempId)
    setExpandedId(null)
  }, [dirty, primaryNodeId])

  // ── Accordion coordination ────────────────────────────────
  const handleToggleExpand = useCallback(
    (id: string) => {
      if (expandedId === id) {
        setExpandedId(null)
      } else {
        setExpandedId(id)
        setExpandedDraftId(null)
      }
    },
    [expandedId]
  )

  const handleToggleDraftExpand = useCallback(
    (tempId: string) => {
      if (expandedDraftId === tempId) {
        setExpandedDraftId(null)
      } else {
        setExpandedDraftId(tempId)
        setExpandedId(null)
      }
    },
    [expandedDraftId]
  )

  // ── Show filter bar when > 20 questions ───────────────────
  const showFilterBar = questions.length > 20

  // ── All questions count (existing + new - deleted) ────────
  const totalCount =
    questions.length + dirty.newQuestions.length - dirty.deletedQuestions.size

  // ── Empty state ───────────────────────────────────────────
  const isEmpty = questions.length === 0 && dirty.newQuestions.length === 0

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Tabs defaultValue="questions" className="flex h-full flex-col overflow-hidden">
        {/* ── Tab bar ───────────────────────────────────────── */}
        <div className="flex shrink-0 items-center border-b border-[#D4DAE3] bg-white px-3">
          <TabsList variant="underline" className="border-b-0">
            <TabsTrigger value="questions">
              Questions
              <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#EEF2FC] px-1 text-[11px] font-medium text-[#1B3FC4]">
                {totalCount}
              </span>
            </TabsTrigger>
            <TabsTrigger value="ei-prompts">
              EI Prompts
              <span className="ml-1.5 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#EEF2FC] px-1 text-[11px] font-medium text-[#1B3FC4]">
                {eiPrompts.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1" />

          {/* + button (always visible, not a tab) */}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-[#1B3FC4] transition-colors duration-150 ease-out hover:bg-[#EEF2FC]"
            title="Add new question"
          >
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Questions tab content ─────────────────────────── */}
        <TabsContent value="questions" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Filter bar */}
          {showFilterBar && (
            <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[#D4DAE3] bg-[#F8F7F5] px-3 py-2">
              <div className="relative min-w-[180px] flex-1">
                <svg
                  className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8896A7]"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search question stems..."
                  className="w-full border border-[#D4DAE3] rounded-sm bg-white py-1 pl-7 pr-2.5 text-sm text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150 ease-out"
                />
              </div>

              <ToggleGroup
                label="Rationale"
                value={rationaleFilter}
                onChange={(v) => setRationaleFilter(v as RationaleFilter)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'has', label: 'Has' },
                  { value: 'missing', label: 'Missing' },
                ]}
              />

              <ToggleGroup
                label="Citation"
                value={citationFilter}
                onChange={(v) => setCitationFilter(v as CitationFilter)}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'has', label: 'Has' },
                  { value: 'missing', label: 'Missing' },
                ]}
              />
            </div>
          )}

          {/* Scrollable question list */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {isEmpty ? (
              /* ── Empty state ──────────────────────────────── */
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF2FC]">
                  <svg className="h-6 w-6 text-[#1B3FC4]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M9 12h6m-3-3v6m-6 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1A2332]">
                    No questions for this topic yet
                  </p>
                  <p className="mt-1 max-w-[280px] text-xs text-[#8896A7]">
                    Add the first question to start building exam coverage.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="inline-flex items-center gap-1.5 rounded-sm bg-[#1B3FC4] px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Add First Question
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {/* ── New question drafts (appear at top) ───── */}
                {dirty.newQuestions.map((draft, i) => (
                  <DraftQuestionCard
                    key={draft._tempId}
                    draft={draft}
                    index={i}
                    isExpanded={expandedDraftId === draft._tempId}
                    onExpand={() => handleToggleDraftExpand(draft._tempId)}
                    onRemove={() => dirty.removeNewQuestion(draft._tempId)}
                  />
                ))}

                {/* ── Grouped questions ──────────────────────── */}
                {groupedQuestions
                  ? groupedQuestions.map((group) => (
                      <TaxonomyGroup
                        key={group.node.node_id}
                        node={group.node}
                        questions={group.questions}
                        taxonomyNodes={taxonomyNodes}
                        expandedId={expandedId}
                        onToggleExpand={handleToggleExpand}
                        onQuestionUpdate={onQuestionUpdate}
                      />
                    ))
                  : /* ── Flat question list ──────────────────── */
                    filteredQuestions.map((q) => (
                      <QuestionCard
                        key={q.question_id}
                        question={q}
                        taxonomyNodes={taxonomyNodes}
                        isExpanded={expandedId === q.question_id}
                        onToggle={() => handleToggleExpand(q.question_id)}
                        isDirty={dirty.questionsDirty.get(q.question_id) ?? false}
                        isDeleted={dirty.deletedQuestions.has(q.question_id)}
                        onUpdate={(data) => onQuestionUpdate(q.question_id, data)}
                        onDelete={() => dirty.queueDeleteQuestion(q.question_id)}
                        onUndoDelete={() => dirty.undoDeleteQuestion(q.question_id)}
                      />
                    ))}

                {/* ── No results after filtering ─────────────── */}
                {filteredQuestions.length === 0 &&
                  dirty.newQuestions.length === 0 &&
                  questions.length > 0 && (
                    <div className="py-8 text-center">
                      <p className="text-sm text-[#8896A7]">
                        No questions match the current filters.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          setRationaleFilter('all')
                          setCitationFilter('all')
                        }}
                        className="mt-2 text-xs text-[#1B3FC4] transition-colors duration-150 ease-out hover:text-[#1535A8]"
                      >
                        Clear filters
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── EI Prompts tab content ────────────────────────── */}
        <TabsContent value="ei-prompts" className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <EIPromptsPanel
            eiPrompts={eiPrompts}
            headings={headings}
            articleId={articleId}
            onEIPromptUpdate={onEIPromptUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
