'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle, Note, Flag } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'

const MOCK_LOG = [
  { id: 1, type: 'quiz', title: 'Completed 25-item Camp Quiz', time: '2h ago', icon: CheckCircle },
  { id: 2, type: 'note', title: 'Saved 3 notes in Renal Anatomy', time: '5h ago', icon: Note },
  { id: 3, type: 'flag', title: 'Flagged 4 items in Biochemistry', time: 'Yesterday', icon: Flag },
  { id: 4, type: 'quiz', title: 'Completed 10-item Storm Session', time: 'Yesterday', icon: CheckCircle },
  { id: 5, type: 'wiki', title: 'Read Article: Glomerular Filtration', time: '2 days ago', icon: Note },
]

export const ActivityLog = () => {
  return (
    <Card className='border-zinc-200 bg-white shadow-none'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-[11px] font-bold tracking-wider text-zinc-500 uppercase'>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='max-h-[180px] overflow-y-auto space-y-3 pr-2 wiki-sidebar-scroll'>
          {MOCK_LOG.map((item) => (
            <div key={item.id} className='flex items-start gap-3 border-b border-zinc-50 pb-2 last:border-0'>
              <div className='mt-0.5 rounded bg-zinc-50 p-1.5'>
                <SCIcon icon={item.icon} size='xs' className='text-zinc-400' />
              </div>
              <div className='flex flex-col'>
                <span className='text-[13px] font-medium text-zinc-900'>{item.title}</span>
                <span className='text-[11px] text-zinc-400 flex items-center gap-1'>
                  <SCIcon icon={Clock} size='xs' /> {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
