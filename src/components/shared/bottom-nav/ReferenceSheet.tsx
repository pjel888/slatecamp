'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { BookOpen, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'

interface ReferenceSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const REFERENCE_LINKS = [
  {
    title: 'Knowledge Wiki',
    description: 'Browse verified architecture concepts and building codes',
    href: ROUTES.WIKI,
    icon: BookOpen,
  },
  {
    title: 'Question Bank',
    description: 'Explore practice questions by subject and topic',
    href: ROUTES.LIBRARY,
    icon: BookOpen,
  },
]

export function ReferenceSheet({ open, onOpenChange }: ReferenceSheetProps) {
  const router = useRouter()

  function handleNavigate(href: string) {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='h-[60vh]'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <BookOpen className='h-5 w-5 text-slatecamp-amber' />
            Reference Materials
          </SheetTitle>
          <SheetDescription>
            Quick access to verified study materials and resources
          </SheetDescription>
        </SheetHeader>

        <div className='mt-6 space-y-3'>
          {REFERENCE_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <button
                key={link.title}
                onClick={() => handleNavigate(link.href)}
                className='w-full flex items-start gap-4 p-4 rounded-xl border border-slatecamp-border bg-slatecamp-paper-cool hover:bg-slatecamp-paper-cool/80 transition-colors text-left group'
              >
                <div className='shrink-0 p-2 rounded-lg bg-slatecamp-amber/10'>
                  <Icon className='h-5 w-5 text-slatecamp-amber' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-1'>
                    <h3 className='font-medium text-slatecamp-ink-main'>
                      {link.title}
                    </h3>
                    <ExternalLink className='h-4 w-4 text-slatecamp-ink-muted group-hover:text-slatecamp-amber transition-colors' />
                  </div>
                  <p className='text-sm text-slatecamp-ink-muted'>
                    {link.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
