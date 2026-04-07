'use client'

import { useState, useCallback, useMemo } from 'react'
import { useDirtyState } from './DirtyStateProvider'
import type { EIPromptData, ParsedHeading, EIPromptDraft } from './types'

// ─── Props ───────────────────────────────────────────────────

interface EIPromptsPanelProps {
  eiPrompts: EIPromptData[]
  headings: ParsedHeading[]
  articleId: string
  onEIPromptUpdate: (promptId: string, data: Partial<EIPromptData>) => void
}

// ─── Helpers ─────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-warning-50 text-warning',
  review: 'bg-warning-50 text-warning',
  published: 'bg-success-50 text-emerald',
  archived: 'bg-surface-light text-text-tertiary',
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  review: 'Review',
  published: 'Published',
  archived: 'Archived',
}

const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max)}...` : text

const findClosestHeading = (
  input: string,
  headings: ParsedHeading[]
): string | null => {
  const lower = input.toLowerCase()
  for (const h of headings) {
    if (h.text.toLowerCase().includes(lower) || lower.includes(h.text.toLowerCase())) {
      return h.text
    }
  }
  for (const h of headings) {
    if (h.text.toLowerCase().startsWith(lower.slice(0, 4))) {
      return h.text
    }
  }
  return headings[0]?.text ?? null
}

// ─── Single EI Prompt Card ──────────────────────────────────

interface PromptCardProps {
  prompt: EIPromptData
  headings: ParsedHeading[]
  isDeleted: boolean
  onUpdate: (promptId: string, data: Partial<EIPromptData>) => void
  onDelete: (promptId: string) => void
  onUndoDelete: (promptId: string) => void
}

const PromptCard = ({
  prompt,
  headings,
  isDeleted,
  onUpdate,
  onDelete,
  onUndoDelete,
}: PromptCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const [headingValidation, setHeadingValidation] = useState<{
    status: 'none' | 'found' | 'not-found'
    suggestion: string | null
  }>({ status: 'none', suggestion: null })
  const [showOptions, setShowOptions] = useState(prompt.options.length > 0)

  const validateHeading = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setHeadingValidation({ status: 'none', suggestion: null })
        return
      }
      const match = headings.find(
        (h) => h.text.toLowerCase() === value.toLowerCase()
      )
      if (match) {
        setHeadingValidation({ status: 'found', suggestion: null })
      } else {
        const closest = findClosestHeading(value, headings)
        setHeadingValidation({ status: 'not-found', suggestion: closest })
      }
    },
    [headings]
  )

  const handleOptionTextChange = useCallback(
    (index: number, text: string) => {
      const next = [...prompt.options]
      next[index] = { ...next[index], text }
      onUpdate(prompt.prompt_id, { options: next })
    },
    [prompt.options, prompt.prompt_id, onUpdate]
  )

  const handleOptionCorrectToggle = useCallback(
    (index: number) => {
      const next = prompt.options.map((opt, i) => ({
        ...opt,
        is_correct: i === index,
      }))
      onUpdate(prompt.prompt_id, { options: next })
    },
    [prompt.options, prompt.prompt_id, onUpdate]
  )

  const handleAddOption = useCallback(() => {
    const next = [...prompt.options, { text: '', is_correct: false }]
    onUpdate(prompt.prompt_id, { options: next })
  }, [prompt.options, prompt.prompt_id, onUpdate])

  const handleRemoveOption = useCallback(
    (index: number) => {
      const next = prompt.options.filter((_, i) => i !== index)
      onUpdate(prompt.prompt_id, { options: next })
    },
    [prompt.options, prompt.prompt_id, onUpdate]
  )

  if (isDeleted) {
    return (
      <div className="rounded-md border-2 border-destructive bg-destructive-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-destructive">
              Delete on next save
            </span>
            <span className="text-xs text-text-secondary">
              {truncate(prompt.prompt_text, 60)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onUndoDelete(prompt.prompt_id)}
            className="rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-text-secondary transition-colors duration-150 ease-out hover:border-text-tertiary hover:text-text-primary"
          >
            Undo
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border border-border bg-card transition-shadow duration-150 ease-out hover:shadow-sm">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        {/* Chevron */}
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-text-tertiary transition-transform duration-150 ease-out ${expanded ? 'rotate-90' : ''}`}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M6 3l5 5-5 5V3z" />
        </svg>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          {/* Heading reference */}
          <span className="shrink-0 text-xs text-text-tertiary">After:</span>
          <span className="shrink-0 text-xs font-medium text-text-primary">
            &ldquo;{prompt.insert_after_heading || 'No heading'}&rdquo;
          </span>

          {/* Status badge */}
          <span
            className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[11px] font-medium ${STATUS_STYLES[prompt.status] ?? STATUS_STYLES.draft}`}
          >
            {STATUS_LABELS[prompt.status] ?? 'Draft'}
          </span>

          {/* Active indicator */}
          {prompt.is_active ? (
            <span className="shrink-0 rounded-sm bg-success-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald">
              active
            </span>
          ) : (
            <span className="shrink-0 rounded-sm bg-surface-light px-1.5 py-0.5 text-[11px] font-medium text-text-tertiary">
              inactive
            </span>
          )}
        </div>

        {/* Truncated prompt text */}
        <span className="hidden min-w-0 truncate text-xs text-text-secondary md:block">
          {truncate(prompt.prompt_text, 100)}
        </span>

        {/* Delete button (stop propagation to avoid toggle) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(prompt.prompt_id)
          }}
          className="shrink-0 rounded-sm p-1 text-text-tertiary transition-colors duration-150 ease-out hover:bg-destructive-50 hover:text-destructive"
          aria-label="Delete prompt"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
            <path
              fillRule="evenodd"
              d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 010-2H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </button>

      {/* Expanded fields */}
      {expanded && (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {/* Insert after heading */}
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Insert after heading
            </label>
            <input
              type="text"
              value={prompt.insert_after_heading}
              onChange={(e) =>
                onUpdate(prompt.prompt_id, {
                  insert_after_heading: e.target.value,
                })
              }
              onBlur={(e) => validateHeading(e.target.value)}
              placeholder="e.g. Key Innovations"
              className="w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
            />
            {headingValidation.status === 'found' && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald">
                <span aria-hidden="true">&#10003;</span> Heading found
              </p>
            )}
            {headingValidation.status === 'not-found' && (
              <p className="mt-1 text-[11px] text-warning">
                <span aria-hidden="true">&#9888;</span> No matching heading
                found
                {headingValidation.suggestion && (
                  <>
                    {' '}
                    &mdash; did you mean: &ldquo;
                    <button
                      type="button"
                      onClick={() => {
                        onUpdate(prompt.prompt_id, {
                          insert_after_heading:
                            headingValidation.suggestion!,
                        })
                        setHeadingValidation({
                          status: 'found',
                          suggestion: null,
                        })
                      }}
                      className="font-medium underline transition-colors duration-150 ease-out hover:text-text-primary"
                    >
                      {headingValidation.suggestion}
                    </button>
                    &rdquo;?
                  </>
                )}
              </p>
            )}
          </div>

          {/* Prompt text */}
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Question
            </label>
            <textarea
              value={prompt.prompt_text}
              onChange={(e) =>
                onUpdate(prompt.prompt_id, { prompt_text: e.target.value })
              }
              rows={3}
              placeholder="The question shown to students..."
              className="w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
            />
          </div>

          {/* Reveal text */}
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Answer
            </label>
            <textarea
              value={prompt.reveal_text}
              onChange={(e) =>
                onUpdate(prompt.prompt_id, { reveal_text: e.target.value })
              }
              rows={3}
              placeholder="The answer revealed after student responds..."
              className="w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
            />
          </div>

          {/* MCQ Options */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <label className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                MCQ Options
              </label>
              <button
                type="button"
                onClick={() => setShowOptions((prev) => !prev)}
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-out ${showOptions ? 'bg-camp-cobalt' : 'bg-border'}`}
                role="switch"
                aria-checked={showOptions}
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${showOptions ? 'translate-x-3' : 'translate-x-0'}`}
                />
              </button>
            </div>

            {showOptions && (
              <div className="space-y-2">
                {prompt.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-${prompt.prompt_id}`}
                      checked={opt.is_correct}
                      onChange={() => handleOptionCorrectToggle(i)}
                      className="h-3.5 w-3.5 accent-camp-cobalt"
                      aria-label={`Mark option ${i + 1} as correct`}
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="min-w-0 flex-1 rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-text-primary outline-none transition-colors duration-150 ease-out placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      className="shrink-0 rounded-sm p-0.5 text-text-tertiary transition-colors duration-150 ease-out hover:text-destructive"
                      aria-label={`Remove option ${i + 1}`}
                    >
                      <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                        <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="text-xs font-medium text-camp-cobalt transition-colors duration-150 ease-out hover:text-primary-700"
                >
                  + Add option
                </button>
              </div>
            )}
          </div>

          {/* Status + Active + Sort Order row */}
          <div className="flex flex-wrap items-end gap-4">
            {/* Status */}
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Status
              </label>
              <select
                value={prompt.status}
                onChange={(e) =>
                  onUpdate(prompt.prompt_id, { status: e.target.value })
                }
                className="cursor-pointer rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
              >
                <option value="draft">Draft</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Active toggle */}
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Show to students
              </label>
              <button
                type="button"
                onClick={() =>
                  onUpdate(prompt.prompt_id, {
                    is_active: !prompt.is_active,
                  })
                }
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 ease-out ${prompt.is_active ? 'bg-emerald' : 'bg-border'}`}
                role="switch"
                aria-checked={prompt.is_active}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${prompt.is_active ? 'translate-x-4' : 'translate-x-0.5'}`}
                />
              </button>
            </div>

            {/* Sort order */}
            <div>
              <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
                Sort order
              </label>
              <input
                type="number"
                value={prompt.sort_order}
                onChange={(e) =>
                  onUpdate(prompt.prompt_id, {
                    sort_order: parseInt(e.target.value, 10) || 0,
                  })
                }
                min={0}
                className="w-16 rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Draft Card (for new unsaved prompts) ────────────────────

interface DraftCardProps {
  draft: EIPromptDraft
  headings: ParsedHeading[]
  onUpdate: (tempId: string, data: Partial<EIPromptDraft>) => void
  onRemove: (tempId: string) => void
}

const DraftCard = ({ draft, headings, onUpdate, onRemove }: DraftCardProps) => {
  const [headingValidation, setHeadingValidation] = useState<{
    status: 'none' | 'found' | 'not-found'
    suggestion: string | null
  }>({ status: 'none', suggestion: null })
  const [showOptions, setShowOptions] = useState(false)

  const validateHeading = useCallback(
    (value: string) => {
      if (!value.trim()) {
        setHeadingValidation({ status: 'none', suggestion: null })
        return
      }
      const match = headings.find(
        (h) => h.text.toLowerCase() === value.toLowerCase()
      )
      if (match) {
        setHeadingValidation({ status: 'found', suggestion: null })
      } else {
        const closest = findClosestHeading(value, headings)
        setHeadingValidation({ status: 'not-found', suggestion: closest })
      }
    },
    [headings]
  )

  const handleOptionTextChange = useCallback(
    (index: number, text: string) => {
      const next = [...draft.options]
      next[index] = { ...next[index], text }
      onUpdate(draft._tempId, { options: next })
    },
    [draft.options, draft._tempId, onUpdate]
  )

  const handleOptionCorrectToggle = useCallback(
    (index: number) => {
      const next = draft.options.map((opt, i) => ({
        ...opt,
        is_correct: i === index,
      }))
      onUpdate(draft._tempId, { options: next })
    },
    [draft.options, draft._tempId, onUpdate]
  )

  const handleAddOption = useCallback(() => {
    const next = [...draft.options, { text: '', is_correct: false }]
    onUpdate(draft._tempId, { options: next })
  }, [draft.options, draft._tempId, onUpdate])

  const handleRemoveOption = useCallback(
    (index: number) => {
      const next = draft.options.filter((_, i) => i !== index)
      onUpdate(draft._tempId, { options: next })
    },
    [draft.options, draft._tempId, onUpdate]
  )

  return (
    <div className="rounded-md border-2 border-dashed border-camp-cobalt/30 bg-primary-50/30 px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-camp-cobalt">New EI Prompt</span>
        <button
          type="button"
          onClick={() => onRemove(draft._tempId)}
          className="rounded-sm p-1 text-text-tertiary transition-colors duration-150 ease-out hover:bg-destructive-50 hover:text-destructive"
          aria-label="Remove draft"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Insert after heading */}
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
            Insert after heading
          </label>
          <input
            type="text"
            value={draft.insert_after_heading}
            onChange={(e) =>
              onUpdate(draft._tempId, {
                insert_after_heading: e.target.value,
              })
            }
            onBlur={(e) => validateHeading(e.target.value)}
            placeholder="e.g. Key Innovations"
            className="w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
          />
          {headingValidation.status === 'found' && (
            <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald">
              <span aria-hidden="true">&#10003;</span> Heading found
            </p>
          )}
          {headingValidation.status === 'not-found' && (
            <p className="mt-1 text-[11px] text-warning">
              <span aria-hidden="true">&#9888;</span> No matching heading found
              {headingValidation.suggestion && (
                <>
                  {' '}
                  &mdash; did you mean: &ldquo;
                  <button
                    type="button"
                    onClick={() => {
                      onUpdate(draft._tempId, {
                        insert_after_heading: headingValidation.suggestion!,
                      })
                      setHeadingValidation({ status: 'found', suggestion: null })
                    }}
                    className="font-medium underline transition-colors duration-150 ease-out hover:text-text-primary"
                  >
                    {headingValidation.suggestion}
                  </button>
                  &rdquo;?
                </>
              )}
            </p>
          )}
        </div>

        {/* Prompt text */}
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
            Question
          </label>
          <textarea
            value={draft.prompt_text}
            onChange={(e) =>
              onUpdate(draft._tempId, { prompt_text: e.target.value })
            }
            rows={3}
            placeholder="The question shown to students..."
            className="w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
          />
        </div>

        {/* Reveal text */}
        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
            Answer
          </label>
          <textarea
            value={draft.reveal_text}
            onChange={(e) =>
              onUpdate(draft._tempId, { reveal_text: e.target.value })
            }
            rows={3}
            placeholder="The answer revealed after student responds..."
            className="w-full rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
          />
        </div>

        {/* MCQ Options */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <label className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              MCQ Options
            </label>
            <button
              type="button"
              onClick={() => setShowOptions((prev) => !prev)}
              className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-150 ease-out ${showOptions ? 'bg-camp-cobalt' : 'bg-border'}`}
              role="switch"
              aria-checked={showOptions}
            >
              <span
                className={`pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${showOptions ? 'translate-x-3' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {showOptions && (
            <div className="space-y-2">
              {draft.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-draft-${draft._tempId}`}
                    checked={opt.is_correct}
                    onChange={() => handleOptionCorrectToggle(i)}
                    className="h-3.5 w-3.5 accent-camp-cobalt"
                    aria-label={`Mark option ${i + 1} as correct`}
                  />
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="min-w-0 flex-1 rounded-sm border border-border bg-card px-2.5 py-1 text-xs text-text-primary outline-none transition-colors duration-150 ease-out placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(i)}
                    className="shrink-0 rounded-sm p-0.5 text-text-tertiary transition-colors duration-150 ease-out hover:text-destructive"
                    aria-label={`Remove option ${i + 1}`}
                  >
                    <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                      <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-medium text-camp-cobalt transition-colors duration-150 ease-out hover:text-primary-700"
              >
                + Add option
              </button>
            </div>
          )}
        </div>

        {/* Status + Active + Sort Order row */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Status
            </label>
            <select
              value={draft.status}
              onChange={(e) =>
                onUpdate(draft._tempId, { status: e.target.value })
              }
              className="cursor-pointer rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Show to students
            </label>
            <button
              type="button"
              onClick={() =>
                onUpdate(draft._tempId, { is_active: !draft.is_active })
              }
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-150 ease-out ${draft.is_active ? 'bg-emerald' : 'bg-border'}`}
              role="switch"
              aria-checked={draft.is_active}
            >
              <span
                className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${draft.is_active ? 'translate-x-4' : 'translate-x-0.5'}`}
              />
            </button>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-text-tertiary">
              Sort order
            </label>
            <input
              type="number"
              value={draft.sort_order}
              onChange={(e) =>
                onUpdate(draft._tempId, {
                  sort_order: parseInt(e.target.value, 10) || 0,
                })
              }
              min={0}
              className="w-16 rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs text-text-primary outline-none transition-colors duration-150 ease-out focus:border-camp-cobalt focus:ring-1 focus:ring-camp-cobalt/30"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────

export const EIPromptsPanel = ({
  eiPrompts,
  headings,
  articleId,
  onEIPromptUpdate,
}: EIPromptsPanelProps) => {
  const dirty = useDirtyState()

  const sorted = useMemo(
    () => [...eiPrompts].sort((a, b) => a.sort_order - b.sort_order),
    [eiPrompts]
  )

  const handleAdd = useCallback(() => {
    const draft: EIPromptDraft = {
      _tempId: crypto.randomUUID(),
      article_id: articleId,
      node_id: null,
      insert_after_heading: '',
      prompt_text: '',
      reveal_text: '',
      options: [],
      sort_order: eiPrompts.length,
      is_active: true,
      status: 'draft',
    }
    dirty.addNewEIPrompt(draft)
  }, [articleId, eiPrompts.length, dirty])

  // Empty state
  if (sorted.length === 0 && dirty.newEIPrompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
        <p className="mb-1 text-sm text-text-secondary">
          No EI prompts for this article yet.
        </p>
        <p className="mb-4 text-xs text-text-tertiary">
          Add prompts to create check-your-understanding moments.
        </p>
        <button
          type="button"
          onClick={handleAdd}
          className="rounded-sm bg-camp-cobalt px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700"
        >
          + Add First Prompt
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3 p-4">
      {/* Existing prompts */}
      {sorted.map((prompt) => (
        <PromptCard
          key={prompt.prompt_id}
          prompt={prompt}
          headings={headings}
          isDeleted={dirty.deletedEIPrompts.has(prompt.prompt_id)}
          onUpdate={onEIPromptUpdate}
          onDelete={dirty.queueDeleteEIPrompt}
          onUndoDelete={dirty.undoDeleteEIPrompt}
        />
      ))}

      {/* New draft prompts */}
      {dirty.newEIPrompts.map((draft) => (
        <DraftCard
          key={draft._tempId}
          draft={draft}
          headings={headings}
          onUpdate={dirty.updateNewEIPrompt}
          onRemove={dirty.removeNewEIPrompt}
        />
      ))}

      {/* Add button */}
      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-sm border border-dashed border-border bg-transparent px-4 py-2.5 text-xs font-medium text-camp-cobalt transition-colors duration-150 ease-out hover:border-camp-cobalt hover:bg-primary-50"
      >
        + Add EI Prompt
      </button>
    </div>
  )
}
