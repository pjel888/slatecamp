'use client'

import { Clock, ListChecks } from '@phosphor-icons/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { TrailDay } from '@/types/app'
import { SUBJECT_COLORS } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  CatchUpView                                                        */
/*  Modal showing missed days without shame — just facts.              */
/* ------------------------------------------------------------------ */

interface CatchUpViewProps {
  missedDays: TrailDay[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onCatchUp: () => void
  onSkip: () => void
}

export const CatchUpView = ({
  missedDays,
  open,
  onOpenChange,
  onCatchUp,
  onSkip,
}: CatchUpViewProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#1A2332]">
            While you were away
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable list of missed days */}
        <ScrollArea className="max-h-[360px]">
          <div className="flex flex-col gap-2 pr-2">
            {missedDays.map((day) => {
              const stepCount = day.steps?.length ?? 0
              const subjectColor =
                day.subject_color ??
                (day.subject_focus
                  ? SUBJECT_COLORS[day.subject_focus] ?? '#D4DAE3'
                  : '#D4DAE3')

              return (
                <div
                  key={day.day_id}
                  className="flex items-start gap-3 rounded-md border border-[#D4DAE3] bg-white p-3"
                >
                  {/* Subject color indicator */}
                  <div
                    className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: subjectColor }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#8896A7]">
                        Day {day.day_number}
                      </span>
                      {day.subject_focus && (
                        <span className="text-[11px] text-[#8896A7]">
                          &middot; {day.subject_focus}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#1A2332] mt-0.5">
                      {day.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-[#4A5568]">
                        <ListChecks size={12} className="text-[#8896A7]" />
                        {stepCount} steps
                      </span>
                      <span className="flex items-center gap-1 text-xs text-[#4A5568]">
                        <Clock size={12} className="text-[#8896A7]" />
                        ~{day.estimated_minutes} min
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* CTAs */}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCatchUp}
            className="rounded-sm border border-[#D4DAE3] bg-transparent px-4 py-2 text-sm font-medium text-[#4A5568] transition-colors duration-150 ease-out hover:bg-[#F5F5F5]"
          >
            Catch up on missed days
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-sm bg-[#1B3FC4] px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-[#1535A8]"
          >
            Pick up where I left off
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
