/**
 * PLANNED COMPONENT
 * Scaffolded for upcoming 3D Lab hotspot quiz interactions.
 * 0 imports today because no 3D scene has been wired to use it yet.
 * Do NOT delete — needed by upcoming modules in the 3D Lab build list.
 */
'use client'

import { useState } from 'react'

interface HotspotQuestionOption {
  id: string
  text: string
}

interface HotspotQuestionProps {
  questionText: string
  options: HotspotQuestionOption[]
  correctOptionId: string
  codeCitation: string
  consequenceText?: string
  onAnswer: (selectedId: string, isCorrect: boolean) => void
}

export const HotspotQuestion = ({ questionText, options, correctOptionId, codeCitation, consequenceText, onAnswer }: HotspotQuestionProps) => {
  const [selected, setSelected] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)

  const handleSelect = (optionId: string) => {
    if (revealed) return
    setSelected(optionId)
  }

  const handleConfirm = () => {
    if (!selected) return
    const isCorrect = selected === correctOptionId
    setRevealed(true)
    onAnswer(selected, isCorrect)
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-[13px] font-medium text-zinc-900 leading-relaxed">{questionText}</p>

      <div className="space-y-2">
        {options.map((opt) => {
          let classes = 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
          if (revealed && opt.id === correctOptionId) classes = 'bg-emerald-50 border-[#2D9F6F]'
          if (revealed && opt.id === selected && opt.id !== correctOptionId) classes = 'bg-red-50 border-[#D64545]'
          if (!revealed && opt.id === selected) classes = 'bg-[#EEF2FC] border-[#1B3FC4]'

          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`w-full text-left px-3 py-2.5 rounded-sm border text-[13px] text-zinc-700 transition-colors duration-150 ${classes}`}
            >
              {opt.text}
            </button>
          )
        })}
      </div>

      {!revealed && selected && (
        <button
          onClick={handleConfirm}
          className="w-full py-2.5 bg-[#1B3FC4] text-white text-[13px] font-medium rounded-sm hover:bg-[#1535A8] transition-colors duration-150"
        >
          Confirm Answer
        </button>
      )}

      {revealed && (
        <div className="mt-3 p-3 bg-zinc-50 rounded-sm border border-zinc-200">
          <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.15em] text-[#1B3FC4] mb-1">
            Code Reference
          </p>
          <p className="text-[12px] text-zinc-600 leading-relaxed">{codeCitation}</p>
          {consequenceText && (
            <p className="text-[12px] text-zinc-500 mt-1.5 italic">{consequenceText}</p>
          )}
        </div>
      )}
    </div>
  )
}
