'use client'

import { BookOpen, CalendarCheck, Target } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Card } from '@/components/ui/card'

interface CompetenceSignalCardProps {
  totalAnswered: number
  topicsMastered: number
  studyDaysCount: number
}

export function CompetenceSignalCard({
  totalAnswered,
  topicsMastered,
  studyDaysCount,
}: CompetenceSignalCardProps) {
  const signals = [
    {
      icon: Target,
      value: topicsMastered > 0 ? topicsMastered.toString() : '—',
      label: 'Topics mastered',
      color: 'text-[#2D9F6F]',
      bg: 'bg-[#EDFAF4]',
    },
    {
      icon: BookOpen,
      value: totalAnswered > 0 ? formatCount(totalAnswered) : '—',
      label: 'Questions answered',
      color: 'text-[#1B3FC4]',
      bg: 'bg-[#EEF2FC]',
    },
    {
      icon: CalendarCheck,
      value: studyDaysCount > 0 ? studyDaysCount.toString() : '—',
      label: 'Study days',
      color: 'text-[#4A5568]',
      bg: 'bg-[#F8F7F5]',
    },
  ]

  return (
    <div className='grid grid-cols-1 gap-2'>
      {signals.map(({ icon: Icon, value, label, color, bg }) => (
        <Card
          key={label}
          className='p-3 flex items-center gap-2.5'
        >
          <div className={`p-1.5 rounded-md ${bg} shrink-0`}>
            <SCIcon icon={Icon} size='xs' className={color} />
          </div>
          <div className='min-w-0'>
            <p className={`text-4xl font-extrabold leading-none tabular-nums ${color}`}>{value}</p>
            <p className='text-[11px] text-[#8896A7] mt-0.5 leading-tight truncate'>{label}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function CompetenceSignalCardSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-2'>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className='bg-white rounded-md border border-[#D4DAE3] p-3 flex items-center gap-2.5 animate-pulse'
        >
          <div className='w-7 h-7 bg-[#F8F7F5] rounded-md shrink-0' />
          <div className='space-y-1 flex-1'>
            <div className='h-6 bg-[#D4DAE3] rounded w-10' />
            <div className='h-2 bg-[#F8F7F5] rounded w-20' />
          </div>
        </div>
      ))}
    </div>
  )
}
