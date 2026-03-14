'use client'

import * as React from 'react'
import { useDiscipline } from '@/lib/context/discipline-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DisciplineCard() {
  const { activeDiscipline, allDisciplines, switchDiscipline } = useDiscipline()
  const [isSwitching, setIsSwitching] = React.useState(false)

  const handleSwitch = async (id: string) => {
    if (id === activeDiscipline?.discipline_id) return
    setIsSwitching(true)
    try {
      await switchDiscipline(id)
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <Card className='border-zinc-200 shadow-sm overflow-hidden'>
      <CardHeader className='bg-zinc-50/50 border-b border-zinc-100'>
        <div className='flex items-center gap-3'>
          <div className='bg-blue-100 p-2 rounded-xl'>
            <GraduationCap className='h-5 w-5 text-blue-600' />
          </div>
          <div>
            <CardTitle className='text-base font-bold'>Active Discipline</CardTitle>
            <CardDescription className='text-xs'>
              Select the licensure exam you are currently preparing for.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='p-0'>
        <div className='divide-y divide-zinc-100'>
          {allDisciplines.map((discipline) => {
            const isActive = activeDiscipline?.discipline_id === discipline.discipline_id
            
            return (
              <button
                key={discipline.discipline_id}
                onClick={() => handleSwitch(discipline.discipline_id)}
                disabled={isSwitching}
                className={cn(
                  'w-full flex items-center justify-between p-4 text-left transition-all hover:bg-zinc-50 disabled:opacity-50',
                  isActive && 'bg-blue-50/30'
                )}
              >
                <div className='flex items-center gap-4'>
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center border',
                    isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-zinc-200'
                  )}>
                    <span className={cn(
                      'text-xs font-black uppercase',
                      isActive ? 'text-white' : 'text-zinc-400'
                    )}>
                      {discipline.acronym}
                    </span>
                  </div>
                  <div>
                    <p className='text-sm font-bold text-zinc-900'>{discipline.name}</p>
                    <p className='text-[10px] text-zinc-500 uppercase tracking-wider font-medium'>
                      Official PRC Syllabus • 2026 Edition
                    </p>
                  </div>
                </div>
                {isActive && (
                  <div className='bg-blue-600 rounded-full p-1'>
                    <Check className='h-3 w-3 text-white' strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
        
        <div className='p-4 bg-amber-50/50 border-t border-amber-100 flex gap-3'>
          <AlertCircle className='h-4 w-4 text-amber-600 shrink-0 mt-0.5' />
          <p className='text-[11px] text-amber-800 leading-relaxed'>
            <strong>Note:</strong> Switching your active discipline will change the entire dashboard context, including your Wiki, Readiness Score, and Question Bank. Subscription costs may vary by discipline.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
