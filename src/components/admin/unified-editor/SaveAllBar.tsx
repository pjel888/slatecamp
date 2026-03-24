'use client'

import { useEffect, useCallback, useState, useRef } from 'react'
import { useDirtyState } from './DirtyStateProvider'
import type { QuestionData, EIPromptData, SaveItemResult } from './types'
import {
  updateArticleFull,
  updateQuestion,
  createEIPrompt,
  updateEIPrompt,
  deleteEIPrompt,
  getArticleUpdatedAt,
} from '@/lib/actions/admin/content'
import {
  createQuestion,
  deleteQuestions,
} from '@/lib/actions/admin/questions'

// ─── Props ───────────────────────────────────────────────────

interface SaveAllBarProps {
  articleState: {
    article_id: string
    title: string
    content: string
    status: string
    difficulty_label?: string
    ale_tests_you?: string
    updated_note?: string
    subject_label?: string
    reviewer_comments?: string
    /** The updated_at timestamp when the page first loaded (for conflict detection) */
    initial_updated_at?: string
  }
  questions: QuestionData[]
  eiPrompts: EIPromptData[]
  isSaving: boolean
  setIsSaving: (v: boolean) => void
  setSaveError: (v: string | null) => void
  onSaveComplete: () => void
}

// ─── Component ───────────────────────────────────────────────

export const SaveAllBar = ({
  articleState,
  questions,
  eiPrompts,
  isSaving,
  setIsSaving,
  setSaveError,
  onSaveComplete,
}: SaveAllBarProps) => {
  const dirty = useDirtyState()
  const [results, setResults] = useState<SaveItemResult[]>([])
  const [conflictWarning, setConflictWarning] = useState(false)
  const pendingSaveRef = useRef(false)

  const failedResults = results.filter((r) => !r.success)
  const successResults = results.filter((r) => r.success)

  // ── Core save execution (called after conflict check) ───────

  const doSave = useCallback(async () => {
    setIsSaving(true)
    setSaveError(null)
    setResults([])

    const promises: Promise<SaveItemResult>[] = []

    // ── Article ──────────────────────────────────────────────
    if (dirty.articleDirty) {
      promises.push(
        (async (): Promise<SaveItemResult> => {
          try {
            const { error } = await updateArticleFull(articleState.article_id, {
              title: articleState.title,
              content: articleState.content,
              status: articleState.status,
              difficulty_label: articleState.difficulty_label,
              ale_tests_you: articleState.ale_tests_you,
              updated_note: articleState.updated_note,
              subject_label: articleState.subject_label,
              reviewer_comments: articleState.reviewer_comments,
            })
            if (error) throw new Error(error.message)
            return {
              type: 'article',
              id: articleState.article_id,
              label: 'Article',
              success: true,
            }
          } catch (err) {
            return {
              type: 'article',
              id: articleState.article_id,
              label: 'Article',
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            }
          }
        })()
      )
    }

    // ── Dirty existing questions ─────────────────────────────
    for (const [questionId, isDirty] of dirty.questionsDirty) {
      if (!isDirty) continue
      const q = questions.find((item) => item.question_id === questionId)
      if (!q) continue

      promises.push(
        (async (): Promise<SaveItemResult> => {
          try {
            const { error } = await updateQuestion(questionId, {
              text: q.text,
              options: q.options,
              correct_option_id: q.correct_option_id,
              rationale: q.rationale ?? undefined,
              explanation: q.explanation ?? undefined,
              code_citation: q.code_citation ?? undefined,
              difficulty: q.difficulty ?? undefined,
              is_assessment: q.is_assessment,
              application_context: q.application_context ?? undefined,
              practice_context: q.practice_context ?? undefined,
              prompt_image_url: q.prompt_image_url ?? undefined,
            })
            if (error) throw new Error(error.message)
            return {
              type: 'question',
              id: questionId,
              label: `Q: ${q.text.slice(0, 40)}...`,
              success: true,
            }
          } catch (err) {
            return {
              type: 'question',
              id: questionId,
              label: `Q: ${q.text.slice(0, 40)}...`,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            }
          }
        })()
      )
    }

    // ── New questions ────────────────────────────────────────
    for (const draft of dirty.newQuestions) {
      promises.push(
        (async (): Promise<SaveItemResult> => {
          try {
            const { error } = await createQuestion({
              text: draft.text,
              options: draft.options.map((o) => ({
                text: o.text,
                is_correct: o.id === draft.correct_option_id,
              })),
              topic_id: draft.topic_id,
              difficulty: draft.difficulty,
              rationale: draft.rationale || undefined,
              code_citation: draft.code_citation || undefined,
              application_context: draft.application_context || undefined,
              practice_context:
                draft.practice_context.length > 0
                  ? draft.practice_context
                  : undefined,
            })
            if (error) throw new Error(error.message)
            return {
              type: 'question',
              id: draft._tempId,
              label: `New Q: ${draft.text.slice(0, 40)}...`,
              success: true,
            }
          } catch (err) {
            return {
              type: 'question',
              id: draft._tempId,
              label: `New Q: ${draft.text.slice(0, 40)}...`,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            }
          }
        })()
      )
    }

    // ── Deleted questions ────────────────────────────────────
    for (const deletedId of dirty.deletedQuestions) {
      promises.push(
        (async (): Promise<SaveItemResult> => {
          try {
            const { error } = await deleteQuestions([deletedId])
            if (error) throw new Error(error.message)
            return {
              type: 'question',
              id: deletedId,
              label: `Delete Q: ${deletedId.slice(0, 8)}`,
              success: true,
            }
          } catch (err) {
            return {
              type: 'question',
              id: deletedId,
              label: `Delete Q: ${deletedId.slice(0, 8)}`,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            }
          }
        })()
      )
    }

    // ── Dirty existing EI prompts ────────────────────────────
    for (const [promptId, isDirty] of dirty.eiPromptsDirty) {
      if (!isDirty) continue
      const p = eiPrompts.find((item) => item.prompt_id === promptId)
      if (!p) continue

      promises.push(
        (async (): Promise<SaveItemResult> => {
          try {
            const { error } = await updateEIPrompt(promptId, {
              insert_after_heading: p.insert_after_heading,
              prompt_text: p.prompt_text,
              reveal_text: p.reveal_text,
              options: p.options,
              sort_order: p.sort_order,
              is_active: p.is_active,
              status: p.status,
            })
            if (error) throw new Error(error.message)
            return {
              type: 'ei_prompt',
              id: promptId,
              label: `EI: ${p.prompt_text.slice(0, 40)}...`,
              success: true,
            }
          } catch (err) {
            return {
              type: 'ei_prompt',
              id: promptId,
              label: `EI: ${p.prompt_text.slice(0, 40)}...`,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            }
          }
        })()
      )
    }

    // ── New EI prompts ───────────────────────────────────────
    for (const draft of dirty.newEIPrompts) {
      promises.push(
        (async (): Promise<SaveItemResult> => {
          try {
            const { error } = await createEIPrompt({
              article_id: draft.article_id,
              node_id: draft.node_id ?? undefined,
              insert_after_heading: draft.insert_after_heading,
              prompt_text: draft.prompt_text,
              reveal_text: draft.reveal_text,
              options: draft.options,
              sort_order: draft.sort_order,
              status: draft.status,
            })
            if (error) throw new Error(error.message)
            return {
              type: 'ei_prompt',
              id: draft._tempId,
              label: `New EI: ${draft.prompt_text.slice(0, 40)}...`,
              success: true,
            }
          } catch (err) {
            return {
              type: 'ei_prompt',
              id: draft._tempId,
              label: `New EI: ${draft.prompt_text.slice(0, 40)}...`,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            }
          }
        })()
      )
    }

    // ── Deleted EI prompts ───────────────────────────────────
    for (const deletedId of dirty.deletedEIPrompts) {
      promises.push(
        (async (): Promise<SaveItemResult> => {
          try {
            const { error } = await deleteEIPrompt(deletedId)
            if (error) throw new Error(error.message)
            return {
              type: 'ei_prompt',
              id: deletedId,
              label: `Delete EI: ${deletedId.slice(0, 8)}`,
              success: true,
            }
          } catch (err) {
            return {
              type: 'ei_prompt',
              id: deletedId,
              label: `Delete EI: ${deletedId.slice(0, 8)}`,
              success: false,
              error: err instanceof Error ? err.message : 'Unknown error',
            }
          }
        })()
      )
    }

    // ── Execute all in parallel ──────────────────────────────
    const settled = await Promise.allSettled(promises)
    const allResults: SaveItemResult[] = settled.map((result) =>
      result.status === 'fulfilled'
        ? result.value
        : {
            type: 'article' as const,
            id: 'unknown',
            label: 'Unknown',
            success: false,
            error:
              result.reason instanceof Error
                ? result.reason.message
                : 'Unexpected error',
          }
    )

    setResults(allResults)

    const failed = allResults.filter((r) => !r.success)
    const succeeded = allResults.filter((r) => r.success)

    if (failed.length === 0) {
      // All succeeded
      dirty.resetAllDirty()
      setSaveError(null)
      onSaveComplete()
    } else {
      // Partial failure — clear dirty state only for successful items
      setSaveError(`${failed.length} item${failed.length !== 1 ? 's' : ''} failed to save`)

      for (const item of succeeded) {
        if (item.type === 'article') {
          // Article succeeded but we only have resetAllDirty — skip granular reset
          // The article dirty flag will remain; user retries will no-op safely
        } else if (item.type === 'question') {
          dirty.resetQuestionDirty(item.id)
        } else if (item.type === 'ei_prompt') {
          dirty.resetEIPromptDirty(item.id)
        }
      }
    }

    setIsSaving(false)
  }, [
    setIsSaving,
    setSaveError,
    onSaveComplete,
    dirty,
    articleState,
    questions,
    eiPrompts,
  ])

  // ── Conflict-aware save entry point ────────────────────────

  const executeSave = useCallback(async () => {
    if (isSaving) return

    // Only run conflict check when article is dirty and we have an initial timestamp
    if (dirty.articleDirty && articleState.initial_updated_at) {
      try {
        const serverTs = await getArticleUpdatedAt(articleState.article_id)
        if (serverTs && serverTs !== articleState.initial_updated_at) {
          // Server version is newer — show conflict warning
          pendingSaveRef.current = true
          setConflictWarning(true)
          return
        }
      } catch {
        // If the check fails, proceed with save anyway
      }
    }

    await doSave()
  }, [isSaving, dirty.articleDirty, articleState, doSave])

  // ── Listen for custom save event ───────────────────────────

  useEffect(() => {
    const handler = () => { executeSave() }
    window.addEventListener('unified-editor:save', handler)
    return () => window.removeEventListener('unified-editor:save', handler)
  }, [executeSave])

  // ── Conflict dialog handlers ────────────────────────────────

  const handleConflictSaveAnyway = useCallback(async () => {
    setConflictWarning(false)
    pendingSaveRef.current = false
    await doSave()
  }, [doSave])

  const handleConflictCancel = useCallback(() => {
    setConflictWarning(false)
    pendingSaveRef.current = false
  }, [])

  // ── Retry failed items ─────────────────────────────────────

  const handleRetry = useCallback(() => {
    setResults([])
    setSaveError(null)
    dispatchSaveEvent()
  }, [setSaveError])

  const handleDismiss = useCallback(() => {
    setResults([])
    setSaveError(null)
  }, [setSaveError])

  // ── Conflict warning dialog ─────────────────────────────────

  if (conflictWarning) {
    return (
      <div className="border-b border-[#D4DAE3] bg-[#FEF8ED] px-4 py-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FEF8ED] border border-[#D4951A]/40">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 4v4m0 2.5h.01M14.5 8a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" stroke="#D4951A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#1A2332]">
              Concurrent edit detected
            </p>
            <p className="mt-0.5 text-xs text-[#4A5568]">
              This article was modified by another user since you started editing. Saving now will overwrite their changes.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleConflictCancel}
              className="rounded-sm border border-[#D4DAE3] px-3 py-1 text-xs text-[#4A5568] transition-colors duration-150 ease-out hover:border-[#8896A7] hover:text-[#1A2332]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConflictSaveAnyway}
              className="rounded-sm bg-[#D64545] px-3 py-1 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#b33a3a]"
            >
              Save anyway
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Render nothing when no errors ──────────────────────────

  if (failedResults.length === 0) return null

  return (
    <div className="border-b border-[#D4DAE3] bg-[#FEF8ED] px-4 py-2">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-[#D4951A]">
            {failedResults.length} item{failedResults.length !== 1 ? 's' : ''}{' '}
            failed to save
            {successResults.length > 0 && (
              <span className="text-[#2D9F6F]">
                {' '}
                ({successResults.length} succeeded)
              </span>
            )}
          </p>

          <ul className="mt-1 space-y-0.5">
            {results.map((r) => (
              <li key={`${r.type}-${r.id}`} className="flex items-center gap-1.5 text-[11px]">
                {r.success ? (
                  <span className="text-[#2D9F6F]" aria-label="Succeeded">
                    &#10003;
                  </span>
                ) : (
                  <span className="text-[#D64545]" aria-label="Failed">
                    &#10007;
                  </span>
                )}
                <span className={r.success ? 'text-[#4A5568]' : 'text-[#1A2332]'}>
                  {r.label}
                </span>
                {r.error && (
                  <span className="text-[#D64545]">&mdash; {r.error}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={handleRetry}
            className="rounded-sm bg-[#1B3FC4] px-3 py-1 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
          >
            Retry failed items
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-sm border border-[#D4DAE3] px-3 py-1 text-xs text-[#4A5568] transition-colors duration-150 ease-out hover:border-[#8896A7] hover:text-[#1A2332]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Helper ──────────────────────────────────────────────────

const dispatchSaveEvent = () => {
  window.dispatchEvent(new CustomEvent('unified-editor:save'))
}
