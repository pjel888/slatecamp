'use client'

import {
  CheckCircle,
  XCircle,
  CaretDown,
  CaretUp,
  Scales,
  Flag,
} from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { getCorrectOptionId } from '@/lib/utils/question'
import type { Question, Choice } from '@/types/app'

interface QuestionReviewListProps {
  questions: Question[]
  answers: Record<string, string>
  expandedQuestions: Set<string>
  onToggleExpand: (qId: string) => void
  interactionMap: Record<string, any>
  topicNames?: Record<string, string>
}

export const QuestionReviewList = ({
  questions,
  answers,
  expandedQuestions,
  onToggleExpand,
  interactionMap,
  topicNames,
}: QuestionReviewListProps) => (
  <div className='space-y-4 mb-10'>
    <h2 className='text-[11px] font-black uppercase tracking-[0.3em] text-text-tertiary'>
      Question Review
    </h2>
    <div className='space-y-2'>
      {questions.map((q, idx) => {
        const userAnswer = answers[q.question_id]
        const correctId = getCorrectOptionId(q)
        const isCorrect = userAnswer === correctId
        const options = (q.options as unknown as Choice[]) || []
        const userOption = options.find((o) => o.id === userAnswer)
        const correctOption = options.find((o) => o.id === correctId)
        const interaction = interactionMap[q.question_id]
        const isFlagged = interaction?.is_flagged
        const isExpanded = expandedQuestions.has(q.question_id)
        const topicName = topicNames?.[q.topic_id] || ''
        const timeMs = interaction?.time_spent_ms

        return (
          <div key={q.question_id} className='bg-white border border-border rounded-md overflow-hidden'>
            {/* Summary row */}
            <button
              onClick={() => onToggleExpand(q.question_id)}
              className='w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors'
            >
              <span className='text-[11px] font-bold text-text-tertiary w-6 shrink-0'>
                {idx + 1}
              </span>
              <SCIcon
                icon={isCorrect ? CheckCircle : XCircle}
                size='sm'
                weight='fill'
                className={isCorrect ? 'text-emerald shrink-0' : 'text-destructive shrink-0'}
              />
              <span className='text-sm text-text-primary flex-1 truncate'>{q.text}</span>
              <div className='flex items-center gap-2 shrink-0'>
                {isFlagged && <SCIcon icon={Flag} size='xs' weight='fill' className='text-warning' />}
                {timeMs && timeMs > 0 && (
                  <span className='text-[11px] text-text-tertiary font-medium tabular-nums'>
                    {Math.round(timeMs / 1000)}s
                  </span>
                )}
                {topicName && (
                  <span className='hidden md:block text-[11px] text-text-tertiary bg-muted px-2 py-0.5 rounded-sm max-w-[120px] truncate'>
                    {topicName}
                  </span>
                )}
                <SCIcon icon={isExpanded ? CaretUp : CaretDown} size='xs' className='text-text-tertiary' />
              </div>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className='px-4 pb-4 pt-0 border-t border-border/50 space-y-3'>
                <div className='ml-9 space-y-2'>
                  {/* User's answer */}
                  <div className='flex items-start gap-2'>
                    <span className='text-[11px] font-bold uppercase tracking-wider text-text-tertiary w-20 shrink-0 pt-0.5'>
                      Your answer
                    </span>
                    <span className={cn('text-sm', isCorrect ? 'text-emerald' : 'text-destructive')}>
                      {userOption?.text || 'No answer'}
                    </span>
                  </div>
                  {/* Correct answer (if wrong) */}
                  {!isCorrect && correctOption && (
                    <div className='flex items-start gap-2'>
                      <span className='text-[11px] font-bold uppercase tracking-wider text-text-tertiary w-20 shrink-0 pt-0.5'>
                        Correct
                      </span>
                      <span className='text-sm text-emerald font-medium'>{correctOption.text}</span>
                    </div>
                  )}
                  {/* Rationale */}
                  {!isCorrect && q.rationale && (
                    <div className='mt-2 p-3 bg-primary-50 border border-primary/10 rounded-md'>
                      <p className='text-[13px] text-text-secondary leading-relaxed'>{typeof q.rationale === 'string' ? q.rationale : (q.rationale as any)?.correct || ''}</p>
                      {q.code_citation && (
                        <div className='flex items-center gap-1.5 mt-2 text-[12px] text-text-secondary'>
                          <SCIcon icon={Scales} size='xs' className='text-text-tertiary' />
                          {q.code_citation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  </div>
)
