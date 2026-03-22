'use client'

import { parseMdxProp } from './parse-mdx-prop'

interface FormulaStep {
  variable: string
  operator: string
  operands: string[]
  comment?: string
  divides?: boolean
  symbol?: '×' | '÷' | '−' | '+'
}

export const FormulaBlock = ({ label, steps }: { label: string; steps: FormulaStep[] | string }) => {
  const parsed = parseMdxProp<FormulaStep[]>(steps, [])
  return (
    <div className="not-prose bg-[#1A1A2E] rounded-[10px] px-6 py-5 my-4">
      <div className="font-[var(--font-dm-mono)] text-[9px] uppercase tracking-[0.12em] text-[#7BA7F5] mb-3">
        {label}
      </div>
      {parsed.map((step, i) => (
        <div key={i} className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-[var(--font-dm-mono)] text-sm text-[#F5C842] font-medium">
            {step.variable}
          </span>
          <span className="font-[var(--font-dm-mono)] text-sm text-[#888]">
            {step.operator}
          </span>
          {step.operands.map((op, j) => (
            <span key={j} className="flex items-center gap-2">
              <span className="font-[var(--font-dm-mono)] text-sm text-[#F5C842] font-medium">
                {op}
              </span>
              {j < step.operands.length - 1 && (
                <span className="font-[var(--font-dm-mono)] text-sm text-[#888]">
                  {step.symbol ?? (step.divides ? '÷' : '×')}
                </span>
              )}
            </span>
          ))}
          {step.comment && (
            <span className="text-xs text-[#888] ml-2">
              {'// ' + step.comment}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
