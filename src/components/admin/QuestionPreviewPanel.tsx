'use client'

import { useState, useEffect, useRef } from 'react'
import { CampModePreview } from './preview/CampModePreview'
import { StormModePreview } from './preview/StormModePreview'

type PreviewMode = 'camp' | 'storm'

interface QuestionPreviewPanelProps {
  stem: string
  options: string[]
  correctAnswer: number
  rationale: string
  codeCitation?: string
  difficulty?: number
}

export const QuestionPreviewPanel = ({
  stem,
  options,
  correctAnswer,
  rationale,
  codeCitation,
  difficulty,
}: QuestionPreviewPanelProps) => {
  const [activeMode, setActiveMode] = useState<PreviewMode>('camp')

  // 150ms debounce on incoming props
  const [debouncedProps, setDebouncedProps] = useState({
    stem,
    options,
    correctAnswer,
    rationale,
    codeCitation,
    difficulty,
  })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedProps({ stem, options, correctAnswer, rationale, codeCitation, difficulty })
    }, 150)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [stem, options, correctAnswer, rationale, codeCitation, difficulty])

  return (
    <div className="sticky top-[112px] h-[calc(100vh-112px)] overflow-y-auto flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 rounded-md bg-[#F5F7FA] border border-border shrink-0">
        <button
          type="button"
          onClick={() => setActiveMode('camp')}
          className={`flex-1 h-8 rounded-sm text-[11px] font-black uppercase tracking-wider transition-colors duration-150 ${
            activeMode === 'camp'
              ? 'bg-camp-cobalt text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Camp Mode
        </button>
        <button
          type="button"
          onClick={() => setActiveMode('storm')}
          className={`flex-1 h-8 rounded-sm text-[11px] font-black uppercase tracking-wider transition-colors duration-150 ${
            activeMode === 'storm'
              ? 'bg-camp-cobalt text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Storm Mode
        </button>
      </div>

      {/* Preview */}
      {activeMode === 'camp' ? (
        <CampModePreview
          stem={debouncedProps.stem}
          options={debouncedProps.options}
          correctAnswer={debouncedProps.correctAnswer}
          rationale={debouncedProps.rationale}
          codeCitation={debouncedProps.codeCitation}
          difficulty={debouncedProps.difficulty}
        />
      ) : (
        <StormModePreview
          stem={debouncedProps.stem}
          options={debouncedProps.options}
        />
      )}
    </div>
  )
}
