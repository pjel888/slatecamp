'use client'

import { useState } from 'react'
import { parseMdxProp } from './parse-mdx-prop'

interface QuizOption {
  text: string
  is_correct: boolean
}

interface InlineQuizProps {
  question: string
  options: QuizOption[] | string
  rationale: string
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export const InlineQuiz = ({ question, options: rawOptions, rationale }: InlineQuizProps) => {
  const options = parseMdxProp<QuizOption[]>(rawOptions, [])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const isAnswered = selectedIndex !== null

  const handleSelect = (index: number) => {
    if (isAnswered) return
    setSelectedIndex(index)
  }

  return (
    <div className="not-prose my-6 border border-[camp-cobalt] rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="bg-[camp-cobalt] px-[18px] py-3 flex items-center gap-2.5">
        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[11px] text-white font-bold">
          ?
        </div>
        <span className="font-[var(--font-dm-mono)] text-xs font-medium text-white uppercase tracking-[0.1em]">
          Quick Check
        </span>
      </div>

      {/* Body */}
      <div className="p-5 bg-white dark:bg-[#1A1A1A]">
        <p className="text-sm font-semibold text-[#1A1A1A] mb-3.5 leading-relaxed dark:text-[#E2E0D8]">
          {question}
        </p>

        <div className="flex flex-col gap-2">
          {options.map((opt, i) => {
            const isSelected = i === selectedIndex
            const isCorrectOption = opt.is_correct

            let containerStyle = 'border-[#E0DED8] hover:border-[camp-cobalt] hover:bg-[#EEF3FD] cursor-pointer'
            let letterStyle = 'border-[#E0DED8] text-[#3D3D3A]'

            if (isAnswered) {
              if (isCorrectOption) {
                containerStyle = 'border-[#1B7A3C] bg-[#EDFAF4]'
                letterStyle = 'bg-[#1B7A3C] text-white border-[#1B7A3C]'
              } else if (isSelected && !isCorrectOption) {
                containerStyle = 'border-[#E63329] bg-[#FFF0EF]'
                letterStyle = 'bg-[#E63329] text-white border-[#E63329]'
              } else {
                containerStyle = 'border-[#E0DED8] opacity-50'
              }
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                disabled={isAnswered}
                className={`flex items-start gap-2.5 px-3.5 py-2.5 border rounded-lg transition-all duration-150 text-left text-[13px] text-[#3D3D3A] dark:text-[#C8C6C0] ${containerStyle}`}
              >
                <span
                  className={`w-[22px] h-[22px] rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-semibold shrink-0 mt-px font-[var(--font-dm-mono)] transition-all duration-150 ${letterStyle}`}
                >
                  {LETTERS[i]}
                </span>
                <span>{opt.text}</span>
              </button>
            )
          })}
        </div>

        {/* Rationale */}
        {isAnswered && (
          <div className="mt-3.5 p-3.5 bg-[#EDFAF4] rounded-lg text-[13px] text-[#3D3D3A] leading-relaxed dark:bg-[#1B7A3C10] dark:text-[#C8C6C0]">
            <span className="font-semibold text-[#1B7A3C]">Correct: {LETTERS[options.findIndex(o => o.is_correct)]}.</span>{' '}
            {rationale}
          </div>
        )}
      </div>
    </div>
  )
}
