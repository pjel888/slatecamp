'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { HelpCircle, BookOpen, MessageSquare, BarChart3 } from 'lucide-react'

interface HelpSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const HELP_SECTIONS = [
  {
    title: 'Getting Started',
    items: [
      'Create an exam profile to track your progress',
      'Explore the Wiki for verified architecture concepts',
      'Start with Review Mode for stress-free learning',
    ],
  },
  {
    title: 'Study Modes',
    items: [
      'Review Mode: Immediate feedback, no tracking',
      'Camp Mode: Tracked quizzes with analytics',
      'Storm Mode: Timed exam simulation',
    ],
  },
  {
    title: 'Features',
    items: [
      'AI Chat: Ask questions, get guided answers',
      'Study Assistant: Process notes and generate flashcards',
      'Analytics: Track your readiness score and weak areas',
    ],
  },
]

export function HelpSheet({ open, onOpenChange }: HelpSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='h-[70vh]'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <HelpCircle className='h-5 w-5 text-slatecamp-amber' />
            Help & Support
          </SheetTitle>
          <SheetDescription>
            Learn how to get the most out of SlateCamp
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-6 overflow-y-auto'>
          {HELP_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className='font-medium text-slatecamp-ink-main mb-3'>
                {section.title}
              </h3>
              <ul className='space-y-2'>
                {section.items.map((item, idx) => (
                  <li
                    key={idx}
                    className='flex items-start gap-2 text-sm text-slatecamp-ink-muted'
                  >
                    <span className='text-slatecamp-amber mt-1'>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className='pt-4 border-t border-slatecamp-border'>
            <p className='text-sm text-slatecamp-ink-muted mb-2'>
              Need more help? Contact support or check our documentation.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
