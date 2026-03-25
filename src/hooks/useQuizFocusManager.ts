// src/hooks/useQuizFocusManager.ts
// Per Doc 7 §1.2 focus management — quiz engine accessibility

import { useCallback, useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface QuizFocusManagerRefs {
  /** The question heading h2 element */
  questionHeadingRef: React.RefObject<HTMLHeadingElement | null>
  /** The feedback panel heading element */
  feedbackPanelRef: React.RefObject<HTMLElement | null>
  /** The first cell in the question palette grid */
  paletteFirstCellRef: React.RefObject<HTMLButtonElement | null>
}

interface QuizFocusManager {
  refs: QuizFocusManagerRefs
  /** Call when a new question loads — focuses question heading */
  focusQuestionHeading: () => void
  /** Call when an answer is submitted in immediate mode — focuses feedback panel */
  focusFeedbackPanel: () => void
  /** Call when palette opens — focuses first cell */
  focusPaletteFirstCell: () => void
  /** Saves current focus and traps to a container element */
  storeFocusAndTrap: (container: HTMLElement) => void
  /** Restores focus to the element stored before trap */
  restoreFocus: () => void
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useQuizFocusManager = (): QuizFocusManager => {
  const questionHeadingRef = useRef<HTMLHeadingElement | null>(null)
  const feedbackPanelRef = useRef<HTMLElement | null>(null)
  const paletteFirstCellRef = useRef<HTMLButtonElement | null>(null)

  // Stores the element that had focus before a trap was applied
  const savedFocusRef = useRef<HTMLElement | null>(null)

  const focusQuestionHeading = useCallback(() => {
    const el = questionHeadingRef.current
    if (!el) return
    // Make heading programmatically focusable if it isn't already
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1')
    }
    // Defer one tick so the element is visible/painted before focus
    requestAnimationFrame(() => el.focus({ preventScroll: false }))
  }, [])

  const focusFeedbackPanel = useCallback(() => {
    const el = feedbackPanelRef.current
    if (!el) return
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1')
    }
    requestAnimationFrame(() => el.focus({ preventScroll: false }))
  }, [])

  const focusPaletteFirstCell = useCallback(() => {
    const el = paletteFirstCellRef.current
    if (!el) return
    requestAnimationFrame(() => el.focus({ preventScroll: false }))
  }, [])

  const storeFocusAndTrap = useCallback((container: HTMLElement) => {
    // Save current focus
    savedFocusRef.current = document.activeElement as HTMLElement | null

    // Move focus into the container — first focusable element wins
    const firstFocusable = container.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    requestAnimationFrame(() => {
      if (firstFocusable) {
        firstFocusable.focus()
      } else {
        container.setAttribute('tabindex', '-1')
        container.focus()
      }
    })
  }, [])

  const restoreFocus = useCallback(() => {
    const el = savedFocusRef.current
    if (!el) return
    requestAnimationFrame(() => {
      if (document.contains(el)) {
        el.focus({ preventScroll: false })
      }
    })
    savedFocusRef.current = null
  }, [])

  return {
    refs: {
      questionHeadingRef,
      feedbackPanelRef,
      paletteFirstCellRef,
    },
    focusQuestionHeading,
    focusFeedbackPanel,
    focusPaletteFirstCell,
    storeFocusAndTrap,
    restoreFocus,
  }
}
