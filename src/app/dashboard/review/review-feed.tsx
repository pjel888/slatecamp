'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useActiveSession } from '@/lib/context/active-session-context'
import { fetchReviewQuestions, logReviewInteraction } from './actions'
import { AnswerResultStrip } from '@/components/quiz/answer-result-strip'
import { ConfidenceTap } from '@/components/quiz/ConfidenceTap'
import { Button } from '@/components/ui/button'
import { ChevronUp, Check, X, Circle, CircleDot, Square, CheckSquare } from 'lucide-react'
import type { Question, Subject, Choice } from '@/types/app'

function isSelectionCorrect(
  selectedIds: string[],
  correctAnswer: string,
): boolean {
  const correctSet = new Set(correctAnswer.split(',').map((s) => s.trim()))
  const selectedSet = new Set(selectedIds)
  if (correctSet.size !== selectedSet.size) return false
  return [...correctSet].every((id) => selectedSet.has(id))
}

interface ReviewFeedProps {
  examProfileId: string
  subjects: Subject[]
  /** Subject to filter by, or null/undefined for random from all subjects. */
  initialSubjectId?: string | null
  initialQuestions: Question[]
}

export function ReviewFeed({
  examProfileId,
  subjects,
  initialSubjectId,
  initialQuestions,
}: ReviewFeedProps) {
  const { setActiveSession } = useActiveSession()

  useEffect(() => {
    setActiveSession('review')
    return () => setActiveSession(null)
  }, [setActiveSession])

  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions as Question[],
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  /** Current selection before "Check Answer". */
  const [selectedChoiceIds, setSelectedChoiceIds] = useState<string[]>([])
  /** After confidence tap, we store result for this question. */
  const [answeredResult, setAnsweredResult] = useState<{
    correct: boolean
  } | null>(null)
  /** F-06: true = "I know this", false = "Not sure" */
  const [selfAssessedKnown, setSelfAssessedKnown] = useState<boolean | null>(
    null,
  )
  const [subjectFilter, setSubjectFilter] = useState<string | null>(
    initialSubjectId ?? null,
  )
  const [cursor, setCursor] = useState<string | null>(
    initialQuestions.length > 0
      ? initialQuestions[initialQuestions.length - 1].created_at
      : null,
  )
  const [loadingMore, setLoadingMore] = useState(false)
  const questionStartTime = useRef(0)
  const hasFetchedInitial = useRef(false)

  useEffect(() => {
    questionStartTime.current = Date.now()
  }, [currentIndex])

  // When mounted with no initial questions (e.g. from review landing flow), fetch first page
  useEffect(() => {
    if (hasFetchedInitial.current || !examProfileId) return
    if (questions.length > 0) return
    hasFetchedInitial.current = true
    fetchReviewQuestions({
      examProfileId,
      subjectId: initialSubjectId ?? undefined,
      limit: 10,
    }).then((r) => {
      setQuestions((r.questions ?? []) as Question[])
      setCursor(r.nextCursor)
    })
  }, [examProfileId, initialSubjectId, questions.length])

  const currentQuestion = questions[currentIndex] as Question | undefined
  const isAnswered = answeredResult !== null
  const choices = (currentQuestion?.choices ?? []) as Choice[]
  const isMultiSelect = currentQuestion?.is_multi_select ?? false
  const correctChoiceIds = (currentQuestion?.correct_answer ?? '')
    .split(',')
    .map((s) => s.trim())
  const correctChoices = choices.filter((c) => correctChoiceIds.includes(c.id))
  const correctChoiceText = correctChoices.map((c) => c.text).join(', ')
  const canCheckAnswer = selectedChoiceIds.length > 0 && !isAnswered
  const correctForDisplay =
    selectedChoiceIds.length > 0
      ? isSelectionCorrect(
          selectedChoiceIds,
          currentQuestion?.correct_answer ?? '',
        )
      : false

  const loadMore = useCallback(async () => {
    if (loadingMore || !cursor) return
    setLoadingMore(true)
    const result = await fetchReviewQuestions({
      examProfileId,
      subjectId: subjectFilter ?? undefined,
      cursor,
      limit: 10,
    })
    setQuestions((prev) => [...prev, ...(result.questions as Question[])])
    setCursor(result.nextCursor)
    setLoadingMore(false)
  }, [examProfileId, subjectFilter, cursor, loadingMore])

  useEffect(() => {
    if (currentIndex >= questions.length - 3) {
      loadMore()
    }
  }, [currentIndex, questions.length, loadMore])

  useEffect(() => {
    setSelectedChoiceIds([])
    setAnsweredResult(null)
    setSelfAssessedKnown(null)
  }, [currentIndex])

  const toggleChoice = useCallback(
    (choiceId: string) => {
      if (isAnswered || !currentQuestion) return
      setSelectedChoiceIds((prev) => {
        if (isMultiSelect) {
          return prev.includes(choiceId)
            ? prev.filter((id) => id !== choiceId)
            : [...prev, choiceId]
        }
        return prev[0] === choiceId ? [] : [choiceId]
      })
    },
    [isAnswered, currentQuestion, isMultiSelect],
  )

  /** F-06: Confidence tap — log self assessment then reveal answer. */
  async function handleConfidenceTap(known: boolean) {
    if (!currentQuestion || isAnswered) return
    const timeMs = Date.now() - questionStartTime.current
    setSelfAssessedKnown(known)
    setAnsweredResult({ correct: correctForDisplay })
    logReviewInteraction({
      examProfileId,
      questionId: currentQuestion.id,
      initialTapCorrect: correctForDisplay,
      timeOnQuestionMs: timeMs,
      selfAssessedKnown: known,
    })
  }

  function handleNext() {
    setAnsweredResult(null)
    setSelectedChoiceIds([])
    setSelfAssessedKnown(null)
    setCurrentIndex((prev) => prev + 1)
    questionStartTime.current = Date.now()
  }

  async function handleSubjectChange(subjectId: string | null) {
    setSubjectFilter(subjectId)
    setCurrentIndex(0)
    setSelectedChoiceIds([])
    setAnsweredResult(null)
    setCursor(null)

    const result = await fetchReviewQuestions({
      examProfileId,
      subjectId: subjectId ?? undefined,
      limit: 10,
    })
    setQuestions(result.questions as Question[])
    setCursor(result.nextCursor)
    questionStartTime.current = Date.now()
  }

  if (!currentQuestion) {
    return (
      <div className='flex h-[60vh] items-center justify-center'>
        <p className='text-muted-foreground'>No questions available yet.</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-[720px]'>
      {/* Subject Filter */}
      <div className='mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none'>
        <button
          onClick={() => handleSubjectChange(null)}
          className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
            !subjectFilter
              ? 'bg-accent-blue text-white'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          All Subjects
        </button>
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSubjectChange(s.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              subjectFilter === s.id
                ? 'bg-accent-blue text-white'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {s.short_name ?? s.name}
          </button>
        ))}
      </div>

      {/* Question card: fixed structure so layout doesn't shift */}
      <div className='flex min-h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
        {/* Scrollable body */}
        <div className='min-h-0 flex-1 overflow-y-auto p-6'>
          {/* Prompt — min height for stability */}
          <div className='min-h-14'>
            <p className='text-base font-medium leading-relaxed text-foreground'>
              {currentQuestion.prompt}
            </p>
          </div>

          {/* Image slot — 1920×1080 landscape (16:9) */}
          <div className='relative mt-4 flex w-full shrink-0 aspect-video items-center justify-center overflow-hidden rounded-xl bg-muted/30'>
            {currentQuestion.prompt_image_url ? (
              <Image
                src={currentQuestion.prompt_image_url}
                alt='Question illustration'
                fill
                className='object-contain'
                sizes='(max-width: 768px) 100vw, 720px'
              />
            ) : (
              <span className='text-xs text-muted-foreground/50'>No image</span>
            )}
          </div>

          <AnswerResultStrip
            isAnswered={isAnswered}
            correct={!!answeredResult?.correct}
            correctChoiceText={correctChoiceText}
            question={currentQuestion}
            threeDLabel='See in 3D'
            showTrickyOne={
              selfAssessedKnown === true && answeredResult?.correct === false
            }
          />

          {/* Choices — fixed min height */}
          <div className='mt-6 min-h-[248px] space-y-3'>
            {choices.map((choice, i) => {
              const isSelected = selectedChoiceIds.includes(choice.id)
              const isCorrectChoice = choice.is_correct
              let stateClass =
                'border-border bg-card hover:border-muted-foreground transition-all duration-150'

              if (isAnswered) {
                if (isCorrectChoice) {
                  stateClass = 'border-quiz-correct-border bg-quiz-correct-bg'
                } else if (isSelected && !isCorrectChoice) {
                  stateClass = 'border-quiz-wrong-border bg-quiz-wrong-bg'
                } else {
                  stateClass = 'border-border bg-card opacity-50'
                }
              } else if (isSelected) {
                stateClass = 'border-accent-blue bg-quiz-selected-bg'
              }

              return (
                <button
                  key={choice.id}
                  type='button'
                  onClick={() => toggleChoice(choice.id)}
                  disabled={isAnswered}
                  role={isMultiSelect ? 'checkbox' : 'radio'}
                  aria-checked={isSelected}
                  className={`flex min-h-[56px] w-full items-center gap-3 rounded-xl border px-4 py-3 text-left ${stateClass}`}
                >
                  {isMultiSelect ? (
                    isSelected ? (
                      <CheckSquare className='h-5 w-5 shrink-0 text-accent-blue' strokeWidth={2} aria-hidden />
                    ) : (
                      <Square className='h-5 w-5 shrink-0 text-muted-foreground' strokeWidth={2} aria-hidden />
                    )
                  ) : isSelected ? (
                    <CircleDot className='h-5 w-5 shrink-0 text-accent-blue' strokeWidth={2} aria-hidden />
                  ) : (
                    <Circle className='h-5 w-5 shrink-0 text-muted-foreground' strokeWidth={2} aria-hidden />
                  )}
                  <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/20 text-xs font-semibold text-muted-foreground'>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className='min-w-0 flex-1 text-sm text-foreground line-clamp-2'>
                    {choice.text}
                  </span>
                  {isAnswered && isCorrectChoice && (
                    <Check
                      className='h-5 w-5 shrink-0 text-success'
                      strokeWidth={2}
                    />
                  )}
                  {isAnswered && isSelected && !isCorrectChoice && (
                    <X
                      className='h-5 w-5 shrink-0 text-danger'
                      strokeWidth={2}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Fixed action bar — F-06: ConfidenceTap when not answered, Next when answered */}
        <div className='shrink-0 border-t border-border bg-card px-6 py-4'>
          {!isAnswered ? (
            <>
              <ConfidenceTap onTap={handleConfidenceTap} />
              {selectedChoiceIds.length > 0 && (
                <p className='mt-2 text-center text-xs text-muted-foreground'>
                  {isMultiSelect
                    ? 'You can select multiple options.'
                    : 'Tap an option to change your answer.'}
                </p>
              )}
            </>
          ) : (
            <Button
              onClick={handleNext}
              className='h-12 w-full gap-2 text-base font-medium'
            >
              Next Question <ChevronUp className='h-5 w-5' strokeWidth={1.5} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
