'use client'

import { useState } from 'react'
import { useDiscipline } from '@/lib/context/discipline-context'
import { CaretDown, CheckCircle, GraduationCap } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
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
        <SCIcon icon={GraduationCap} size='md' className='text-accent-blue' />
      </div>
      {!collapsed && (
        <>
          <div className='min-w-0'>
            <p className='truncate text-xs font-bold text-foreground'>
              {label}
            </p>
          </div>
          <SCIcon
            icon={CaretDown}
            size='xs'
            className={`shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
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
          <div className='absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-popover p-1 shadow-lg'>
            <div className='px-2 py-1.5'>
              <p className='text-[11px] font-black uppercase tracking-wider text-muted-foreground'>
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
                    <SCIcon
                      icon={GraduationCap}
                      size='sm'
                      className={isActive ? 'text-accent-blue' : 'text-muted-foreground'}
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-bold text-foreground'>
                      {discipline.name}
                    </p>
                    <p className='text-[11px] text-muted-foreground uppercase font-black'>
                      {discipline.acronym}
                    </p>
                  </div>
                  {isActive && (
                    <SCIcon
                      icon={CheckCircle}
                      size='sm'
                      className='shrink-0 text-accent-blue'
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
