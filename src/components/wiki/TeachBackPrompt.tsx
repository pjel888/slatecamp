'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  submitTeachBack,
  submitRevision,
  type TeachBackEvaluation,
} from '@/lib/actions/teach-back'
import { CheckCircle, XCircle, WarningCircle, ArrowRight } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface TeachBackPromptProps {
  topicId: string
  topicName: string
  entryPoint: 'wiki' | 'blindspot' | 'trail'
  trailDayId?: string
}

type Phase = 'prompt' | 'submitting' | 'result' | 'revising' | 'done'

export const TeachBackPrompt = ({
  topicId,
  topicName,
  entryPoint,
  trailDayId,
}: TeachBackPromptProps) => {
  const [phase, setPhase] = useState<Phase>('prompt')
  const [response, setResponse] = useState('')
  const [revisedResponse, setRevisedResponse] = useState('')
  const [evaluation, setEvaluation] = useState<TeachBackEvaluation | null>(null)
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleSubmit = async () => {
    if (response.trim().split(/\s+/).length < 20) return // Soft minimum
    setPhase('submitting')
    try {
      const result = await submitTeachBack({
        topicId,
        topicName,
        entryPoint,
        promptText: `Can you explain "${topicName}" in your own words?`,
        studentResponse: response,
        trailDayId,
      })
      setEvaluation(result.evaluation)
      setSubmissionId(result.submission.submission_id)
      setPhase('result')
    } catch {
      setPhase('prompt')
    }
  }

  const handleRevise = async () => {
    if (!submissionId || !revisedResponse.trim()) return
    setPhase('submitting')
    try {
      await submitRevision(submissionId, revisedResponse)
      setPhase('done')
    } catch {
      setPhase('revising')
    }
  }

  const wordCount = response.trim().split(/\s+/).filter(Boolean).length

  // ── Prompt phase ────────────────────────────────────────────────────────
  if (phase === 'prompt') {
    return (
      <div className="mt-10 border-t border-[#D4DAE3] pt-8">
        <div className="max-w-xl">
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-[#8896A7] mb-2">
            Teach-Back
          </p>
          <h3 className="text-base font-semibold text-[#1A2332] mb-1">
            Can you explain this in your own words?
          </h3>
          <p className="text-sm text-[#4A5568] mb-4">
            Explaining a concept forces deeper processing. Write at least 20 words.
          </p>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            aria-label="Explain this concept in your own words"
            placeholder="In my own words, this concept means..."
            rows={6}
            className="w-full px-4 py-3 border border-[#D4DAE3] rounded-md text-sm text-[#1A2332] placeholder:text-[#8896A7] focus:outline-none focus:ring-2 focus:ring-[#1B3FC4]/20 focus:border-[#1B3FC4] resize-y"
          />
          <div className="flex items-center justify-between mt-3">
            <span className={cn(
              'text-xs',
              wordCount >= 20 ? 'text-[#2D9F6F]' : 'text-[#8896A7]',
            )}>
              {wordCount} word{wordCount !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDismissed(true)}
                className="text-sm text-[#8896A7] hover:text-[#4A5568] transition-colors"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={wordCount < 20}
                className={cn(
                  'h-9 px-5 rounded-sm font-bold text-xs uppercase tracking-[0.15em] transition-all',
                  wordCount >= 20
                    ? 'bg-[#1B3FC4] text-white hover:bg-[#1535A8]'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed',
                )}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Submitting phase ────────────────────────────────────────────────────
  if (phase === 'submitting') {
    return (
      <div className="mt-10 border-t border-[#D4DAE3] pt-8">
        <div className="flex items-center gap-3 text-[#4A5568]">
          <div className="h-5 w-5 border-2 border-[#1B3FC4] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Evaluating your explanation...</span>
        </div>
      </div>
    )
  }

  // ── Result phase (gap analysis) ─────────────────────────────────────────
  if (phase === 'result' && evaluation) {
    return (
      <div className="mt-10 border-t border-[#D4DAE3] pt-8 space-y-5">
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-[#8896A7]">
          Gap Analysis
        </p>

        {/* Correct points */}
        {evaluation.correct_points.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#2D9F6F]">
              What you got right
            </p>
            {evaluation.correct_points.map((point, i) => (
              <div key={i} className="flex items-start gap-2">
                <SCIcon icon={CheckCircle} size="xs" className="text-[#2D9F6F] mt-0.5 shrink-0" />
                <span className="text-sm text-[#1A2332]">{point}</span>
              </div>
            ))}
          </div>
        )}

        {/* Gaps */}
        {evaluation.gaps.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#D64545]">
              What was missing
            </p>
            {evaluation.gaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-2">
                <SCIcon icon={XCircle} size="xs" className="text-[#D64545] mt-0.5 shrink-0" />
                <span className="text-sm text-[#1A2332]">{gap}</span>
              </div>
            ))}
          </div>
        )}

        {/* Factual errors */}
        {evaluation.factual_errors.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#D4951A]">
              Factual issues
            </p>
            {evaluation.factual_errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2">
                <SCIcon icon={WarningCircle} size="xs" className="text-[#D4951A] mt-0.5 shrink-0" />
                <span className="text-sm text-[#1A2332]">{err}</span>
              </div>
            ))}
          </div>
        )}

        {/* Revision prompt */}
        {evaluation.revision_prompt && (
          <div className="p-4 bg-[#EEF2FC] border border-[#1B3FC4]/15 rounded-md">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1B3FC4] mb-1">
              Revision Prompt
            </p>
            <p className="text-sm text-[#1A2332] font-medium">
              &ldquo;{evaluation.revision_prompt}&rdquo;
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setRevisedResponse(response)
              setPhase('revising')
            }}
            className="h-9 px-5 rounded-sm bg-[#1B3FC4] text-white font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#1535A8] transition-all flex items-center gap-1.5"
          >
            Revise my answer
            <SCIcon icon={ArrowRight} size="xs" />
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="text-sm text-[#8896A7] hover:text-[#4A5568] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  // ── Revising phase ──────────────────────────────────────────────────────
  if (phase === 'revising') {
    return (
      <div className="mt-10 border-t border-[#D4DAE3] pt-8 space-y-4">
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-[#8896A7]">
          Revise Your Explanation
        </p>
        <textarea
          value={revisedResponse}
          onChange={(e) => setRevisedResponse(e.target.value)}
          rows={6}
          className="w-full px-4 py-3 border border-[#D4DAE3] rounded-md text-sm text-[#1A2332] focus:outline-none focus:ring-2 focus:ring-[#1B3FC4]/20 focus:border-[#1B3FC4] resize-y"
        />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRevise}
            disabled={!revisedResponse.trim()}
            className="h-9 px-5 rounded-sm bg-[#1B3FC4] text-white font-bold text-xs uppercase tracking-[0.15em] hover:bg-[#1535A8] transition-all"
          >
            Submit Revision
          </button>
          <button
            type="button"
            onClick={() => setPhase('result')}
            className="text-sm text-[#8896A7] hover:text-[#4A5568] transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  // ── Done phase ──────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="mt-10 border-t border-[#D4DAE3] pt-8">
        <div className="flex items-center gap-2 text-[#2D9F6F]">
          <SCIcon icon={CheckCircle} size="sm" />
          <span className="text-sm font-medium">Revision saved. Nice work deepening your understanding.</span>
        </div>
      </div>
    )
  }

  return null
}
