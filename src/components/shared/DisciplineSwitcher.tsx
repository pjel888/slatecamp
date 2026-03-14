'use client'

import { useState } from 'react'
import { useDiscipline } from '@/lib/context/discipline-context'
import { ChevronDown, Check, GraduationCap } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

interface DisciplineSwitcherProps {
  collapsed?: boolean
}

export function DisciplineSwitcher({
  collapsed = false,
}: DisciplineSwitcherProps) {
  const { activeDiscipline, allDisciplines, switchDiscipline } = useDiscipline()
  const [open, setOpen] = useState(false)

  const label = activeDiscipline?.acronym ?? 'Select Discipline'

  const button = (
    <button
      onClick={() => setOpen(!open)}
      className={`flex items-center rounded-sm py-2 text-left transition-all hover:bg-secondary ${
        collapsed ? 'justify-start gap-0' : 'gap-2 px-2'
      }`}
    >
      <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-accent-blue/10'>
        <GraduationCap className='h-5 w-5 text-accent-blue' strokeWidth={1.5} />
      </div>
      {!collapsed && (
        <>
          <div className='min-w-0'>
            <p className='truncate text-xs font-bold text-foreground'>
              {label}
            </p>
          </div>
          <ChevronDown
            className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
            strokeWidth={1.5}
          />
        </>
      )}
    </button>
  )

  return (
    <div className='relative'>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='block'>{button}</span>
          </TooltipTrigger>
          <TooltipContent side='right' sideOffset={8}>
            {label}
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}

      {open && (
        <>
          <div className='fixed inset-0 z-40' onClick={() => setOpen(false)} />
          <div className='absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-border bg-popover p-1 shadow-lg'>
            <div className='px-2 py-1.5'>
              <p className='text-[10px] font-black uppercase tracking-wider text-muted-foreground'>
                Active Discipline
              </p>
            </div>

            {allDisciplines.map((discipline) => {
              const isActive = activeDiscipline?.discipline_id === discipline.discipline_id

              return (
                <button
                  key={discipline.discipline_id}
                  onClick={async () => {
                    if (!isActive) await switchDiscipline(discipline.discipline_id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left transition-all ${
                    isActive ? 'bg-accent-blue/5' : 'hover:bg-secondary'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-sm ${
                      isActive ? 'bg-accent-blue/10' : 'bg-secondary'
                    }`}
                  >
                    <GraduationCap
                      className={`h-4 w-4 ${isActive ? 'text-accent-blue' : 'text-muted-foreground'}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-bold text-foreground'>
                      {discipline.name}
                    </p>
                    <p className='text-[10px] text-muted-foreground uppercase font-black'>
                      {discipline.acronym}
                    </p>
                  </div>
                  {isActive && (
                    <Check
                      className='h-4 w-4 shrink-0 text-accent-blue'
                      strokeWidth={1.5}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
