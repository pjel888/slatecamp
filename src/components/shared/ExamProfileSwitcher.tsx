'use client'

import { useState } from 'react'
import { useExamProfile } from '@/lib/context/exam-profile-context'
import { daysUntil } from '@/lib/utils/helpers'
import { ChevronDown, Check, Plus, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

interface ExamProfileSwitcherProps {
  collapsed?: boolean
}

export function ExamProfileSwitcher({
  collapsed = false,
}: ExamProfileSwitcherProps) {
  const { activeProfile, profiles, switchProfile } = useExamProfile()
  const [open, setOpen] = useState(false)

  if (!activeProfile) return null

  const boardExam = activeProfile.board_exams
  const daysLeft = activeProfile.target_exam_date
    ? daysUntil(activeProfile.target_exam_date)
    : null

  const button = (
    <button
      onClick={() => setOpen(!open)}
      className={`flex items-center rounded-lg py-2 text-left transition-all hover:bg-secondary ${
        collapsed ? 'justify-start gap-0' : 'gap-2'
      }`}
    >
      <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-accent-blue/10'>
        <GraduationCap className='h-5 w-5 text-accent-blue' strokeWidth={1.5} />
      </div>
      {!collapsed && (
        <>
          <div className='min-w-0'>
            <p className='truncate text-xs font-medium text-foreground'>
              {boardExam?.short_name ?? 'Exam'}
            </p>
            {/* {daysLeft !== null && (
              <p className="text-[10px] text-muted-foreground">
                {daysLeft}d remaining
              </p>
            )} */}
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
            {boardExam?.short_name ?? 'Exam'}
            {daysLeft !== null ? ` · ${daysLeft}d left` : ''}
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
              <p className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
                Exam Profiles
              </p>
            </div>

            {profiles.map((profile) => {
              const exam = profile.board_exams
              const isActive = profile.id === activeProfile.id
              const days = profile.target_exam_date
                ? daysUntil(profile.target_exam_date)
                : null

              return (
                <button
                  key={profile.id}
                  onClick={async () => {
                    if (!isActive) await switchProfile(profile.id)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-all ${
                    isActive ? 'bg-accent-blue/5' : 'hover:bg-secondary'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      isActive ? 'bg-accent-blue/10' : 'bg-secondary'
                    }`}
                  >
                    <GraduationCap
                      className={`h-4 w-4 ${isActive ? 'text-accent-blue' : 'text-muted-foreground'}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium text-foreground'>
                      {exam?.name ?? 'Exam'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {days !== null ? `${days} days left` : 'No target date'}
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

            <div className='mt-1 border-t border-border pt-1'>
              <Link
                href='/onboarding?add=true'
                onClick={() => setOpen(false)}
                className='flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-all hover:bg-secondary hover:text-foreground'
              >
                <Plus className='h-4 w-4' strokeWidth={1.5} />
                Add Exam Profile
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
