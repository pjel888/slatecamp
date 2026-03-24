'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { QuestionDraft, EIPromptDraft } from './types'

// ─── Context Shape ───────────────────────────────────────────

interface DirtyState {
  // State
  articleDirty: boolean
  questionsDirty: Map<string, boolean>
  eiPromptsDirty: Map<string, boolean>
  newQuestions: QuestionDraft[]
  newEIPrompts: EIPromptDraft[]
  deletedQuestions: Set<string>
  deletedEIPrompts: Set<string>

  // Computed
  isAnythingDirty: boolean
  dirtyCount: number

  // Actions
  markArticleDirty: () => void
  markQuestionDirty: (questionId: string) => void
  markEIPromptDirty: (promptId: string) => void
  addNewQuestion: (draft: QuestionDraft) => void
  updateNewQuestion: (tempId: string, draft: Partial<QuestionDraft>) => void
  removeNewQuestion: (tempId: string) => void
  addNewEIPrompt: (draft: EIPromptDraft) => void
  updateNewEIPrompt: (tempId: string, draft: Partial<EIPromptDraft>) => void
  removeNewEIPrompt: (tempId: string) => void
  queueDeleteQuestion: (questionId: string) => void
  undoDeleteQuestion: (questionId: string) => void
  queueDeleteEIPrompt: (promptId: string) => void
  undoDeleteEIPrompt: (promptId: string) => void
  resetAllDirty: () => void
  resetQuestionDirty: (questionId: string) => void
  resetEIPromptDirty: (promptId: string) => void
}

const DirtyStateContext = createContext<DirtyState | null>(null)

// ─── Provider ────────────────────────────────────────────────

export const DirtyStateProvider = ({ children }: { children: ReactNode }) => {
  const [articleDirty, setArticleDirty] = useState(false)
  const [questionsDirty, setQuestionsDirty] = useState<Map<string, boolean>>(
    () => new Map()
  )
  const [eiPromptsDirty, setEIPromptsDirty] = useState<Map<string, boolean>>(
    () => new Map()
  )
  const [newQuestions, setNewQuestions] = useState<QuestionDraft[]>([])
  const [newEIPrompts, setNewEIPrompts] = useState<EIPromptDraft[]>([])
  const [deletedQuestions, setDeletedQuestions] = useState<Set<string>>(
    () => new Set()
  )
  const [deletedEIPrompts, setDeletedEIPrompts] = useState<Set<string>>(
    () => new Set()
  )

  // Use ref for stable title update (avoid re-render loops)
  const titlePrefix = useRef('')

  const markArticleDirty = useCallback(() => setArticleDirty(true), [])

  const markQuestionDirty = useCallback((questionId: string) => {
    setQuestionsDirty((prev) => {
      const next = new Map(prev)
      next.set(questionId, true)
      return next
    })
  }, [])

  const markEIPromptDirty = useCallback((promptId: string) => {
    setEIPromptsDirty((prev) => {
      const next = new Map(prev)
      next.set(promptId, true)
      return next
    })
  }, [])

  const addNewQuestion = useCallback((draft: QuestionDraft) => {
    setNewQuestions((prev) => [draft, ...prev])
  }, [])

  const updateNewQuestion = useCallback(
    (tempId: string, update: Partial<QuestionDraft>) => {
      setNewQuestions((prev) =>
        prev.map((q) => (q._tempId === tempId ? { ...q, ...update } : q))
      )
    },
    []
  )

  const removeNewQuestion = useCallback((tempId: string) => {
    setNewQuestions((prev) => prev.filter((q) => q._tempId !== tempId))
  }, [])

  const addNewEIPrompt = useCallback((draft: EIPromptDraft) => {
    setNewEIPrompts((prev) => [...prev, draft])
  }, [])

  const updateNewEIPrompt = useCallback(
    (tempId: string, update: Partial<EIPromptDraft>) => {
      setNewEIPrompts((prev) =>
        prev.map((p) => (p._tempId === tempId ? { ...p, ...update } : p))
      )
    },
    []
  )

  const removeNewEIPrompt = useCallback((tempId: string) => {
    setNewEIPrompts((prev) => prev.filter((p) => p._tempId !== tempId))
  }, [])

  const queueDeleteQuestion = useCallback((questionId: string) => {
    setDeletedQuestions((prev) => {
      const next = new Set(prev)
      next.add(questionId)
      return next
    })
  }, [])

  const undoDeleteQuestion = useCallback((questionId: string) => {
    setDeletedQuestions((prev) => {
      const next = new Set(prev)
      next.delete(questionId)
      return next
    })
  }, [])

  const queueDeleteEIPrompt = useCallback((promptId: string) => {
    setDeletedEIPrompts((prev) => {
      const next = new Set(prev)
      next.add(promptId)
      return next
    })
  }, [])

  const undoDeleteEIPrompt = useCallback((promptId: string) => {
    setDeletedEIPrompts((prev) => {
      const next = new Set(prev)
      next.delete(promptId)
      return next
    })
  }, [])

  const resetAllDirty = useCallback(() => {
    setArticleDirty(false)
    setQuestionsDirty(new Map())
    setEIPromptsDirty(new Map())
    setNewQuestions([])
    setNewEIPrompts([])
    setDeletedQuestions(new Set())
    setDeletedEIPrompts(new Set())
  }, [])

  const resetQuestionDirty = useCallback((questionId: string) => {
    setQuestionsDirty((prev) => {
      const next = new Map(prev)
      next.delete(questionId)
      return next
    })
  }, [])

  const resetEIPromptDirty = useCallback((promptId: string) => {
    setEIPromptsDirty((prev) => {
      const next = new Map(prev)
      next.delete(promptId)
      return next
    })
  }, [])

  const isAnythingDirty = useMemo(() => {
    const hasQuestionDirty = Array.from(questionsDirty.values()).some(Boolean)
    const hasEIDirty = Array.from(eiPromptsDirty.values()).some(Boolean)
    return (
      articleDirty ||
      hasQuestionDirty ||
      hasEIDirty ||
      newQuestions.length > 0 ||
      newEIPrompts.length > 0 ||
      deletedQuestions.size > 0 ||
      deletedEIPrompts.size > 0
    )
  }, [
    articleDirty,
    questionsDirty,
    eiPromptsDirty,
    newQuestions,
    newEIPrompts,
    deletedQuestions,
    deletedEIPrompts,
  ])

  const dirtyCount = useMemo(() => {
    let count = articleDirty ? 1 : 0
    count += Array.from(questionsDirty.values()).filter(Boolean).length
    count += Array.from(eiPromptsDirty.values()).filter(Boolean).length
    count += newQuestions.length
    count += newEIPrompts.length
    count += deletedQuestions.size
    count += deletedEIPrompts.size
    return count
  }, [
    articleDirty,
    questionsDirty,
    eiPromptsDirty,
    newQuestions,
    newEIPrompts,
    deletedQuestions,
    deletedEIPrompts,
  ])

  // Update document title with unsaved indicator
  if (typeof document !== 'undefined') {
    const prefix = isAnythingDirty ? '● ' : ''
    if (titlePrefix.current !== prefix) {
      titlePrefix.current = prefix
      const base = document.title.replace(/^● /, '')
      document.title = prefix + base
    }
  }

  const value = useMemo<DirtyState>(
    () => ({
      articleDirty,
      questionsDirty,
      eiPromptsDirty,
      newQuestions,
      newEIPrompts,
      deletedQuestions,
      deletedEIPrompts,
      isAnythingDirty,
      dirtyCount,
      markArticleDirty,
      markQuestionDirty,
      markEIPromptDirty,
      addNewQuestion,
      updateNewQuestion,
      removeNewQuestion,
      addNewEIPrompt,
      updateNewEIPrompt,
      removeNewEIPrompt,
      queueDeleteQuestion,
      undoDeleteQuestion,
      queueDeleteEIPrompt,
      undoDeleteEIPrompt,
      resetAllDirty,
      resetQuestionDirty,
      resetEIPromptDirty,
    }),
    [
      articleDirty,
      questionsDirty,
      eiPromptsDirty,
      newQuestions,
      newEIPrompts,
      deletedQuestions,
      deletedEIPrompts,
      isAnythingDirty,
      dirtyCount,
      markArticleDirty,
      markQuestionDirty,
      markEIPromptDirty,
      addNewQuestion,
      updateNewQuestion,
      removeNewQuestion,
      addNewEIPrompt,
      updateNewEIPrompt,
      removeNewEIPrompt,
      queueDeleteQuestion,
      undoDeleteQuestion,
      queueDeleteEIPrompt,
      undoDeleteEIPrompt,
      resetAllDirty,
      resetQuestionDirty,
      resetEIPromptDirty,
    ]
  )

  return (
    <DirtyStateContext.Provider value={value}>
      {children}
    </DirtyStateContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────

export const useDirtyState = () => {
  const ctx = useContext(DirtyStateContext)
  if (!ctx) throw new Error('useDirtyState must be used within DirtyStateProvider')
  return ctx
}
