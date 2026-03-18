'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import type { Question, QuizSession, Choice } from '@/types/app'
import type { OptionState, QuestionDotState } from '@/components/quiz'
import type { ConfidenceLevel } from '@/components/quiz/ConfidenceToggle'

// ─── LS helpers (duplicated for hook isolation — could extract to shared util) ──

const LS_KEY = (sessionId: string) => `slatecamp_quiz_${sessionId}`

function restoreFromLS(sessionId: string) {
  try {
    const raw = localStorage.getItem(LS_KEY(sessionId))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface QuizStateActions {
  selectAnswer: (choiceId: string) => void
  toggleFlag: () => void
  toggleStrikethrough: (choiceId: string, e: React.MouseEvent | React.KeyboardEvent) => void
  checkAnswer: () => void
  setConfidence: (level: ConfidenceLevel) => void
  goNext: () => void
  goBack: () => void
  jumpTo: (index: number) => void
  setIsRationaleVisible: (v: boolean) => void
  setIsAIOpen: (v: boolean | ((prev: boolean) => boolean)) => void
  setIsSubmitSheetOpen: (v: boolean) => void
}

export interface QuizStateDerived {
  currentQuestion: Question
  options: Choice[]
  correctOptionId: string
  currentIndex: number
  isChecked: boolean
  selectedAnswer: string | undefined
  isFlagged: boolean
  confidence: ConfidenceLevel
  dots: { index: number; state: QuestionDotState }[]
  answeredCount: number
  unansweredCount: number
  flaggedCount: number
  isRationaleVisible: boolean
  isAIOpen: boolean
  isSubmitSheetOpen: boolean
  answers: Record<string, string>
  flaggedQuestions: Set<string>
  struckOptions: Record<string, Set<string>>
  getOptionState: (option: Choice) => OptionState
}

interface UseQuizStateOptions {
  session: QuizSession
  questions: Question[]
  initialInteractions: any[]
  strictMode: boolean
  mode: string
  onAdvancePastEnd: () => void
  onAnswerChecked: (isCorrect: boolean) => void
  onInteractionReady: (data: {
    questionId: string
    optionId: string | null
    isFlagged: boolean
    eliminatedCount: number
    confidence: ConfidenceLevel
    answerChanges: number
  }) => void
}

export function useQuizState({
  session,
  questions,
  initialInteractions,
  strictMode,
  mode,
  onAdvancePastEnd,
  onAnswerChecked,
  onInteractionReady,
}: UseQuizStateOptions): QuizStateDerived & QuizStateActions {
  // ── Core state ────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(
    () => session.current_question_index || 0,
  )
  const [isRationaleVisible, setIsRationaleVisible] = useState(false)
  const [isAIOpen, setIsAIOpen] = useState(false)
  const [isSubmitSheetOpen, setIsSubmitSheetOpen] = useState(false)

  // ── Quiz state — restored from LS on mount ───────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const ls = restoreFromLS(session.session_id)
    if (ls) return ls.answers
    const init: Record<string, string> = {}
    initialInteractions.forEach((i) => {
      if (i.selected_option_id) init[i.question_id] = i.selected_option_id
    })
    return init
  })

  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(() => {
    const ls = restoreFromLS(session.session_id)
    if (ls) return new Set<string>(ls.flags)
    const init = new Set<string>()
    initialInteractions.forEach((i) => {
      if (i.is_flagged) init.add(i.question_id)
    })
    return init
  })

  const [struckOptions, setStruckOptions] = useState<Record<string, Set<string>>>(() => {
    const ls = restoreFromLS(session.session_id)
    if (ls) {
      const restored: Record<string, Set<string>> = {}
      Object.entries(ls.strikes || {}).forEach(([qId, arr]) => {
        restored[qId] = new Set(arr as string[])
      })
      return restored
    }
    const init: Record<string, Set<string>> = {}
    questions.forEach((q) => { init[q.question_id] = new Set() })
    return init
  })

  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(() => {
    const init = new Set<string>()
    initialInteractions.forEach((i) => {
      if (!strictMode && i.selected_option_id && (mode === 'camp' || mode === 'chill' || mode === 'blindspot')) {
        init.add(i.question_id)
      }
    })
    return init
  })

  const [confidenceMap, setConfidenceMap] = useState<Record<string, ConfidenceLevel>>({})

  // answer change tracking
  const answerChangesRef = useRef<Record<string, number>>({})

  // ── Derived ───────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentIndex]
  const options = (currentQuestion?.options as unknown as Choice[]) || []
  const correctOptionId = currentQuestion?.correct_option_id ?? (currentQuestion as any)?.correct_answer
  const isChecked = !strictMode && checkedQuestions.has(currentQuestion?.question_id)
  const selectedAnswer = answers[currentQuestion?.question_id]
  const isFlagged = flaggedQuestions.has(currentQuestion?.question_id)
  const confidence = confidenceMap[currentQuestion?.question_id] ?? null

  const dots = useMemo(
    () => questions.map((q, idx) => {
      let state: QuestionDotState = 'unanswered'
      if (idx === currentIndex) state = 'current'
      else if (flaggedQuestions.has(q.question_id)) state = 'flagged'
      else if (answers[q.question_id]) state = 'answered'
      return { index: idx, state }
    }),
    [questions, currentIndex, answers, flaggedQuestions],
  )

  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount
  const flaggedCount = flaggedQuestions.size

  const getOptionState = useCallback((option: Choice): OptionState => {
    const isSelected = selectedAnswer === option.id
    const isCorrectOpt = option.id === correctOptionId
    const isStruck = struckOptions[currentQuestion?.question_id]?.has(option.id)

    if (!isChecked) {
      if (isSelected) return 'selected'
      if (isStruck) return 'struck'
      return 'default'
    }
    if (isCorrectOpt) return 'correct'
    if (isSelected && !isCorrectOpt) return 'wrong'
    return 'faded'
  }, [selectedAnswer, correctOptionId, struckOptions, currentQuestion?.question_id, isChecked])

  // ── Actions ───────────────────────────────────────────────────────────────

  const resetQuestionUI = useCallback(() => {
    setIsRationaleVisible(false)
    setIsAIOpen(false)
  }, [])

  const selectAnswer = useCallback((choiceId: string) => {
    const qId = currentQuestion.question_id
    if (!strictMode && checkedQuestions.has(qId)) return

    if (answers[qId] && answers[qId] !== choiceId) {
      answerChangesRef.current[qId] = (answerChangesRef.current[qId] || 0) + 1
    }

    const next = { ...answers, [qId]: choiceId }
    setAnswers(next)

    // Chill mode: auto-reveal
    if (mode === 'chill') {
      setCheckedQuestions((prev) => new Set(prev).add(qId))
      setIsRationaleVisible(true)
      onInteractionReady({
        questionId: qId,
        optionId: choiceId,
        isFlagged: flaggedQuestions.has(qId),
        eliminatedCount: struckOptions[qId]?.size || 0,
        confidence: confidenceMap[qId] ?? null,
        answerChanges: answerChangesRef.current[qId] || 0,
      })
      const isCorrect = choiceId === correctOptionId
      onAnswerChecked(isCorrect)
    }
  }, [currentQuestion, strictMode, checkedQuestions, answers, mode, flaggedQuestions, struckOptions, confidenceMap, correctOptionId, onInteractionReady, onAnswerChecked])

  const toggleFlag = useCallback(() => {
    const qId = currentQuestion.question_id
    setFlaggedQuestions((prev) => {
      const next = new Set(prev)
      if (next.has(qId)) next.delete(qId)
      else next.add(qId)
      return next
    })
  }, [currentQuestion])

  const toggleStrikethrough = useCallback((choiceId: string, e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    const qId = currentQuestion.question_id
    if (!strictMode && checkedQuestions.has(qId)) return

    setStruckOptions((prev) => {
      const currentSet = prev[qId] || new Set()
      const next = new Set(currentSet)
      if (next.has(choiceId)) next.delete(choiceId)
      else next.add(choiceId)
      return { ...prev, [qId]: next }
    })
  }, [currentQuestion, strictMode, checkedQuestions])

  const checkAnswer = useCallback(() => {
    const qId = currentQuestion.question_id
    const answer = answers[qId]

    onInteractionReady({
      questionId: qId,
      optionId: answer || null,
      isFlagged: flaggedQuestions.has(qId),
      eliminatedCount: struckOptions[qId]?.size || 0,
      confidence: confidenceMap[qId] ?? null,
      answerChanges: answerChangesRef.current[qId] || 0,
    })

    if (strictMode) {
      // In strict mode, just advance — no feedback
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1)
        resetQuestionUI()
      } else {
        onAdvancePastEnd()
      }
      return
    }

    setCheckedQuestions((prev) => new Set(prev).add(qId))
    setIsRationaleVisible(true)
    const isCorrect = answer === correctOptionId
    onAnswerChecked(isCorrect)
  }, [currentQuestion, answers, flaggedQuestions, struckOptions, confidenceMap, strictMode, currentIndex, questions.length, correctOptionId, onAdvancePastEnd, onAnswerChecked, onInteractionReady, resetQuestionUI])

  const setConfidence = useCallback((level: ConfidenceLevel) => {
    const qId = currentQuestion.question_id
    setConfidenceMap((prev) => ({ ...prev, [qId]: level }))
  }, [currentQuestion])

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      resetQuestionUI()
    } else {
      onAdvancePastEnd()
    }
  }, [currentIndex, questions.length, resetQuestionUI, onAdvancePastEnd])

  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      resetQuestionUI()
    }
  }, [currentIndex, resetQuestionUI])

  const jumpTo = useCallback((idx: number) => {
    if (strictMode) return
    setCurrentIndex(idx)
    resetQuestionUI()
  }, [strictMode, resetQuestionUI])

  return {
    // Derived
    currentQuestion,
    options,
    correctOptionId,
    currentIndex,
    isChecked,
    selectedAnswer,
    isFlagged,
    confidence,
    dots,
    answeredCount,
    unansweredCount,
    flaggedCount,
    isRationaleVisible,
    isAIOpen,
    isSubmitSheetOpen,
    answers,
    flaggedQuestions,
    struckOptions,
    getOptionState,
    // Actions
    selectAnswer,
    toggleFlag,
    toggleStrikethrough,
    checkAnswer,
    setConfidence,
    goNext,
    goBack,
    jumpTo,
    setIsRationaleVisible,
    setIsAIOpen,
    setIsSubmitSheetOpen,
  }
}
