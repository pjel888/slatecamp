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
    <div className="not-prose my-6 border border-camp-cobalt rounded-[10px] overflow-hidden">
      {/* Header */}
      <div className="bg-camp-cobalt px-[18px] py-3 flex items-center gap-2.5">
        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[11px] text-white font-bold">
          ?
        </div>
        <span className="font-[var(--font-dm-mono)] text-xs font-medium text-white uppercase tracking-[0.1em]">
          Quick Check
        </span>
      </div>

      {/* Body */}
      <div className="p-5 bg-white dark:bg-wiki-ink">
        <p className="text-sm font-semibold text-wiki-ink mb-3.5 leading-relaxed dark:text-wiki-invert-heading">
          {question}
        </p>

        <div className="flex flex-col gap-2">
          {options.map((opt, i) => {
            const isSelected = i === selectedIndex
            const isCorrectOption = opt.is_correct

            let containerStyle = 'border-wiki-border hover:border-camp-cobalt hover:bg-cobalt-light cursor-pointer'
            let letterStyle = 'border-wiki-border text-wiki-body'

            if (isAnswered) {
              if (isCorrectOption) {
                containerStyle = 'border-camp-green bg-success-50'
                letterStyle = 'bg-camp-green text-white border-camp-green'
              } else if (isSelected && !isCorrectOption) {
                containerStyle = 'border-camp-red bg-destructive-50'
                letterStyle = 'bg-camp-red text-white border-camp-red'
              } else {
                containerStyle = 'border-wiki-border opacity-50'
              }
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(i)}
                disabled={isAnswered}
                className={`flex items-start gap-2.5 px-3.5 py-2.5 border rounded-lg transition-all duration-150 text-left text-[13px] text-wiki-body dark:text-wiki-invert-body ${containerStyle}`}
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
          <div className="mt-3.5 p-3.5 bg-success-50 rounded-lg text-[13px] text-wiki-body leading-relaxed dark:bg-camp-green/10 dark:text-wiki-invert-body">
            <span className="font-semibold text-camp-green">Correct: {LETTERS[options.findIndex(o => o.is_correct)]}.</span>{' '}
            {rationale}
          </div>
        )}
      </div>
    </div>
  )
}
