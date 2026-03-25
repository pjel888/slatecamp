// src/hooks/useKeyboardShortcuts.ts
// Per Doc 7 §2.1 keyboard map — quiz engine keyboard navigation

import { useEffect } from 'react'
import type { QuizSessionConfig } from '@/types/quiz-config'

// ─── Types ───────────────────────────────────────────────────────────────────

interface KeyboardShortcutsOptions {
  onSelectOption?: (letter: 'A' | 'B' | 'C' | 'D') => void
  onSubmit?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onToggleFlag?: () => void
  onTogglePalette?: () => void
  onSkip?: () => void
  onEscape?: () => void
  onAnnounceTime?: () => void
  /** When false, no shortcuts are registered (modal/overlay is open) */
  active?: boolean
  config?: Pick<QuizSessionConfig, 'navigation' | 'timer'>
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useKeyboardShortcuts = ({
  onSelectOption,
  onSubmit,
  onNext,
  onPrevious,
  onToggleFlag,
  onTogglePalette,
  onSkip,
  onEscape,
  onAnnounceTime,
  active = true,
  config,
}: KeyboardShortcutsOptions) => {
  useEffect(() => {
    if (!active) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when focus is inside a text input or textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Ignore modifier combos (Ctrl/Meta/Alt)
      if (e.ctrlKey || e.metaKey || e.altKey) return

      switch (e.key) {
        // 1–4 → select option A–D
        case '1':
          e.preventDefault()
          onSelectOption?.('A')
          break
        case '2':
          e.preventDefault()
          onSelectOption?.('B')
          break
        case '3':
          e.preventDefault()
          onSelectOption?.('C')
          break
        case '4':
          e.preventDefault()
          onSelectOption?.('D')
          break

        // Enter / Space → submit or advance
        case 'Enter':
        case ' ':
          // Only intercept Space when not on a focusable element that uses it
          if (e.key === ' ' && (target.tagName === 'BUTTON' || target.tagName === 'A')) break
          e.preventDefault()
          onSubmit?.()
          break

        // Escape → close palette / modal / exit confirmation
        case 'Escape':
          e.preventDefault()
          onEscape?.()
          break

        // F → toggle flag
        case 'f':
        case 'F':
          if (config?.navigation?.bookmarkEnabled !== false) {
            e.preventDefault()
            onToggleFlag?.()
          }
          break

        // P → toggle question palette
        case 'p':
        case 'P':
          if (config?.navigation?.questionPalette !== false) {
            e.preventDefault()
            onTogglePalette?.()
          }
          break

        // T → announce time remaining (screen reader)
        case 't':
        case 'T':
          if (config?.timer?.enabled && config?.timer?.visible) {
            e.preventDefault()
            onAnnounceTime?.()
          }
          break

        // ArrowLeft → previous question
        case 'ArrowLeft':
          if (config?.navigation?.backAllowed !== false) {
            e.preventDefault()
            onPrevious?.()
          }
          break

        // ArrowRight → next question
        case 'ArrowRight':
          e.preventDefault()
          onNext?.()
          break

        // S → skip question
        case 's':
        case 'S':
          if (config?.navigation?.skipEnabled !== false) {
            e.preventDefault()
            onSkip?.()
          }
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    active,
    config,
    onSelectOption,
    onSubmit,
    onNext,
    onPrevious,
    onToggleFlag,
    onTogglePalette,
    onSkip,
    onEscape,
    onAnnounceTime,
  ])
}
