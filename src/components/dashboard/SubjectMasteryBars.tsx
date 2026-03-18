'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { SubjectMastery } from '@/types/dashboard'

interface SubjectMasteryBarsProps {
  data: SubjectMastery[]
}

function getBarColor(mastery: number, questionsAnswered: number): string {
  if (questionsAnswered === 0) return '#E8E4DC'
  if (mastery >= 70) return '#6BC09A'
  if (mastery >= 40) return '#F0B07A'
  return '#E89090'
}

export function SubjectMasteryBars({ data }: SubjectMasteryBarsProps) {
  const [animated, setAnimated] = useState(false)
  const hasData = data.some(d => d.questionsAnswered > 0)
  const abovePassing = data.filter(d => d.mastery >= 70).length

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col bg-white border border-[#E8E4DC] rounded-md overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-[#E8E4DC]">
        <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.15em] text-[#6B6B6B]">
          By Subject
        </span>
        <h3 className="text-[15px] font-semibold text-[#1A2332] mt-0.5">
          Mastery Breakdown
        </h3>
      </div>

      <div className="flex-1 p-4 min-h-0 flex flex-col justify-between">
        <div className="space-y-3">
          {data.map((item, i) => {
            const clamped = Math.max(0, Math.min(100, Math.round(item.mastery)))
            const barColor = getBarColor(clamped, item.questionsAnswered)

            return (
              <div key={item.subject}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium text-[#555555] truncate pr-2">
                    {item.subject}
                  </span>
                  <span className="text-[13px] font-medium text-[#1A2332] tabular-nums shrink-0">
                    {clamped}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#F2F0EB] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: animated ? `${Math.max(clamped, 1)}%` : '0%',
                      backgroundColor: barColor,
                      transition: `width 300ms ease-out ${i * 80}ms`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-3 pt-2 border-t border-[#E8E4DC] flex items-center justify-between">
          <p className="text-xs text-[#6B6B6B]">
            {hasData
              ? `${abovePassing} of ${data.length} subjects above passing`
              : 'Your mastery bars fill as you answer questions.'
            }
          </p>
          <Link
            href="/dashboard/analytics"
            className="text-[11px] font-medium underline underline-offset-2 shrink-0 ml-2"
            style={{ color: '#1B3FC4' }}
          >
            Analytics &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
