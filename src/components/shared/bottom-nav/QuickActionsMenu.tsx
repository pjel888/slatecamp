'use client'

import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Plus,
  BookOpen,
  Brain,
  FileText,
  BarChart3,
  Settings,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  label: string
  icon: typeof Plus
  href?: string
  onClick?: () => void
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-note',
    label: 'New Note',
    icon: FileText,
    href: ROUTES.NOTES,
  },
  {
    id: 'start-quiz',
    label: 'Start Quiz',
    icon: Brain,
    href: ROUTES.TESTING,
  },
  {
    id: 'wiki',
    label: 'Browse Wiki',
    icon: BookOpen,
    href: ROUTES.WIKI,
  },
  {
    id: 'analytics',
    label: 'View Analytics',
    icon: BarChart3,
    href: ROUTES.ANALYTICS,
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: ROUTES.SETTINGS,
  },
]

interface QuickActionsMenuProps {
  children: React.ReactNode
  onClose?: () => void
}

export function QuickActionsMenu({
  children,
  onClose,
}: QuickActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleAction(action: QuickAction) {
    if (action.href) {
      router.push(action.href)
    }
    if (action.onClick) {
      action.onClick()
    }
    setOpen(false)
    onClose?.()
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen)
    if (!newOpen) {
      onClose?.()
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side='top'
        align='center'
        sideOffset={12}
        className='w-56 p-2'
      >
        <div className='space-y-1'>
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                  'text-sm text-slatecamp-ink-main',
                  'hover:bg-slatecamp-paper-cool transition-colors',
                  'text-left',
                )}
              >
                <Icon className='h-4 w-4 shrink-0' />
                <span>{action.label}</span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
