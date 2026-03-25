'use client'

import { BookOpen } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

interface TopicStat {
  total: number
  correct: number
  name: string
}

interface TopicBreakdownProps {
  topicStats: Record<string, TopicStat>
}

export const TopicBreakdown = ({ topicStats }: TopicBreakdownProps) => (
  <div className='space-y-4 mb-10'>
    <h2 className='text-[11px] font-black uppercase tracking-[0.3em] text-[text-tertiary]'>
      Topic Breakdown
    </h2>
    <div className='grid grid-cols-1 gap-3'>
      {Object.entries(topicStats).map(([topicId, s]) => {
        const percentage = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
        return (
          <div
            key={topicId}
            className='bg-white p-4 rounded-md border border-[border] flex items-center justify-between'
          >
            <div className='flex items-center gap-3 min-w-0'>
              <div
                className={cn(
                  'w-8 h-8 rounded-md flex items-center justify-center border shrink-0',
                  percentage >= 75
                    ? 'bg-[#EDFAF4] border-[emerald]/20 text-[emerald]'
                    : percentage >= 50
                      ? 'bg-[#FEF8ED] border-[warning]/20 text-[warning]'
                      : 'bg-[#FDF0F0] border-[destructive]/20 text-[destructive]',
                )}
              >
                <SCIcon icon={BookOpen} size='sm' />
              </div>
              <div className='min-w-0'>
                <h4 className='text-sm font-bold text-[text-primary] truncate'>{s.name}</h4>
                <p className='text-[11px] text-[text-tertiary] font-medium'>{s.correct}/{s.total} correct</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <div className='w-24 h-1.5 bg-[#F5F5F5] rounded-full overflow-hidden border border-[border]/30 hidden sm:block'>
                <div
                  className={cn(
                    'h-full rounded-full',
                    percentage >= 75 ? 'bg-[emerald]' : percentage >= 50 ? 'bg-[warning]' : 'bg-[destructive]',
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className='text-sm font-extrabold text-[text-primary] w-10 text-right'>{percentage}%</span>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)
