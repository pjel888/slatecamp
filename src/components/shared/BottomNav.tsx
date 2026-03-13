'use client'

import { useState } from 'react'
import {
  MessageSquare,
  Sparkles,
  Zap,
  BookOpen,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentType, SVGProps } from 'react'
import { AIChatSheet } from './bottom-nav/AIChatSheet'
import { AssistantSheet } from './bottom-nav/AssistantSheet'
import { QuickActionsMenu } from './bottom-nav/QuickActionsMenu'
import { ReferenceSheet } from './bottom-nav/ReferenceSheet'
import { HelpSheet } from './bottom-nav/HelpSheet'

interface PlaceholderItem {
  id: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
}

const PLACEHOLDER_ITEMS: PlaceholderItem[] = [
  { id: 'ai-chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'assistant', label: 'Assistant', icon: Sparkles },
  { id: 'quick-actions', label: 'Quick', icon: Zap },
  { id: 'reference', label: 'Reference', icon: BookOpen },
  { id: 'help', label: 'Help', icon: HelpCircle },
]

export function BottomNav() {
  const [aiChatOpen, setAiChatOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [referenceOpen, setReferenceOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  function handleItemClick(id: string) {
    // Close all other sheets/menus
    setAiChatOpen(false)
    setAssistantOpen(false)
    setReferenceOpen(false)
    setHelpOpen(false)

    // Open the selected item
    switch (id) {
      case 'ai-chat':
        setAiChatOpen(true)
        setActiveId(id)
        break
      case 'assistant':
        setAssistantOpen(true)
        setActiveId(id)
        break
      case 'quick-actions':
        // Quick actions uses a popover, so we don't need to track it
        setActiveId(id)
        break
      case 'reference':
        setReferenceOpen(true)
        setActiveId(id)
        break
      case 'help':
        setHelpOpen(true)
        setActiveId(id)
        break
      default:
        setActiveId(null)
    }
  }


  return (
    <>
      {/* Floating Navigation Bar - Visible on all screen sizes */}
      <nav
        className={cn(
          'fixed left-1/2 -translate-x-1/2 z-[100]',
          'flex items-center justify-center gap-1.5',
          'px-4 py-3',
          'bg-slatecamp-paper-snow dark:bg-slatecamp-ink-slate-black',
          'backdrop-blur-xl backdrop-saturate-150',
          'border border-slatecamp-border dark:border-slatecamp-border',
          'rounded-2xl',
          'shadow-[0_1px_3px_rgba(26,26,26,0.06),0_8px_24px_rgba(0,0,0,0.08)]',
          'dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.4)]',
          'transition-all duration-150 ease',
        )}
        style={{
          // Position with safe-area inset for mobile devices (iOS home indicator, etc.)
          bottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom)))',
          // Ensure it doesn't overflow on small screens and is properly centered
          maxWidth: 'min(calc(100vw - 2rem), 600px)',
        }}
      >
        {PLACEHOLDER_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeId === id

          // Quick Actions uses a Popover, so wrap it differently
          if (id === 'quick-actions') {
            return (
              <QuickActionsMenu
                key={id}
                onClose={() => setActiveId(null)}
              >
                <button
                  onClick={() => handleItemClick(id)}
                  className={cn(
                    'relative flex flex-col items-center justify-center',
                    'min-w-[52px] h-12 rounded-xl',
                    'transition-all duration-150 ease',
                    'outline-none focus-visible:ring-2 focus-visible:ring-slatecamp-amber/50 focus-visible:ring-offset-2',
                    'group',
                    // Active state
                    isActive
                      ? 'bg-slatecamp-ink-main dark:bg-slatecamp-ink-main text-slatecamp-paper-snow'
                      : 'text-slatecamp-ink-muted dark:text-slatecamp-ink-subtle',
                    // Hover state (only when not active)
                    !isActive &&
                      'hover:bg-slatecamp-paper-cool dark:hover:bg-slatecamp-ink-mauve-charcoal/30 hover:text-slatecamp-ink-main dark:hover:text-slatecamp-paper-snow',
                  )}
                  aria-label={label}
                  type='button'
                >
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className='absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slatecamp-amber' />
                  )}

                  {/* Icon */}
                  <Icon
                    className={cn(
                      'h-[20px] w-[20px] transition-all duration-150',
                      isActive && 'scale-105',
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />

                  {/* Label */}
                  <span
                    className={cn(
                      'text-[10px] font-medium mt-0.5 leading-tight',
                      'hidden sm:block',
                      'transition-opacity duration-150',
                      isActive
                        ? 'opacity-100'
                        : 'opacity-70 group-hover:opacity-100',
                    )}
                  >
                    {label}
                  </span>
                </button>
              </QuickActionsMenu>
            )
          }

          return (
            <button
              key={id}
              onClick={() => handleItemClick(id)}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'min-w-[52px] h-12 rounded-xl',
                'transition-all duration-150 ease',
                'outline-none focus-visible:ring-2 focus-visible:ring-slatecamp-amber/50 focus-visible:ring-offset-2',
                'group',
                // Active state
                isActive
                  ? 'bg-slatecamp-ink-main dark:bg-slatecamp-ink-main text-slatecamp-paper-snow'
                  : 'text-slatecamp-ink-muted dark:text-slatecamp-ink-subtle',
                // Hover state (only when not active)
                !isActive &&
                  'hover:bg-slatecamp-paper-cool dark:hover:bg-slatecamp-ink-mauve-charcoal/30 hover:text-slatecamp-ink-main dark:hover:text-slatecamp-paper-snow',
              )}
              aria-label={label}
              type='button'
            >
              {/* Active indicator dot */}
              {isActive && (
                <div className='absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slatecamp-amber' />
              )}

              {/* Icon */}
              <Icon
                className={cn(
                  'h-[20px] w-[20px] transition-all duration-150',
                  isActive && 'scale-105',
                )}
                strokeWidth={isActive ? 2 : 1.5}
              />

              {/* Label (hidden on very small screens, shown on larger mobile) */}
              <span
                className={cn(
                  'text-[10px] font-medium mt-0.5 leading-tight',
                  'hidden sm:block',
                  'transition-opacity duration-150',
                  isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100',
                )}
              >
                {label}
              </span>
            </button>
          )
        })}
      </nav>

      {/* Sheet Components */}
      <AIChatSheet
        open={aiChatOpen}
        onOpenChange={(open) => {
          setAiChatOpen(open)
          if (!open) setActiveId(null)
        }}
      />
      <AssistantSheet
        open={assistantOpen}
        onOpenChange={(open) => {
          setAssistantOpen(open)
          if (!open) setActiveId(null)
        }}
      />
      <ReferenceSheet
        open={referenceOpen}
        onOpenChange={(open) => {
          setReferenceOpen(open)
          if (!open) setActiveId(null)
        }}
      />
      <HelpSheet
        open={helpOpen}
        onOpenChange={(open) => {
          setHelpOpen(open)
          if (!open) setActiveId(null)
        }}
      />
    </>
  )
}
