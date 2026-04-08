'use client'

import { useState, Children, isValidElement, createContext, useContext, useCallback, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ── Context for single-open mode ─────────────────────────────────────────────

interface AccordionContextValue {
  allowMultiple: boolean
  openIndices: Set<number>
  toggle: (index: number) => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

// ── AccordionItem ────────────────────────────────────────────────────────────

export interface AccordionItemProps {
  title: string
  children: ReactNode
  /** Internal — injected by Accordion parent when allowMultiple is false */
  _index?: number
}

export const AccordionItem = ({ title, children, _index }: AccordionItemProps) => {
  // Per-item state (used when rendered outside Accordion or in allowMultiple mode)
  const [localOpen, setLocalOpen] = useState(false)
  const ctx = useContext(AccordionContext)

  const isControlled = ctx !== null && _index !== undefined
  const isOpen = isControlled ? ctx.openIndices.has(_index) : localOpen

  const handleToggle = useCallback(() => {
    if (isControlled) {
      ctx.toggle(_index)
    } else {
      setLocalOpen((prev) => !prev)
    }
  }, [isControlled, ctx, _index])

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={cn(
          'w-full flex justify-between items-center px-[18px] py-3.5',
          'bg-background text-left text-sm font-semibold text-foreground',
          'transition-colors duration-150 hover:bg-muted/50',
        )}
      >
        {title}
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={cn(
            'text-muted-foreground transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div role="region" hidden={!isOpen} className="px-[18px] pb-4">
        <div className="text-[13px] text-muted-foreground leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Accordion ────────────────────────────────────────────────────────────────

export interface AccordionProps {
  children: ReactNode
  /** Allow multiple items to be open simultaneously (default: false) */
  allowMultiple?: boolean
}

export const Accordion = ({ children, allowMultiple = false }: AccordionProps) => {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set())

  const toggle = useCallback(
    (index: number) => {
      setOpenIndices((prev) => {
        const next = new Set(prev)
        if (next.has(index)) {
          next.delete(index)
        } else {
          if (!allowMultiple) next.clear()
          next.add(index)
        }
        return next
      })
    },
    [allowMultiple],
  )

  // Clone AccordionItem children to inject _index for controlled mode
  const items: ReactNode[] = []
  let index = 0
  Children.forEach(children, (child) => {
    if (isValidElement<AccordionItemProps>(child) && child.props.title !== undefined) {
      const currentIndex = index
      items.push(
        <AccordionItem
          key={currentIndex}
          {...child.props}
          _index={currentIndex}
        />,
      )
      index++
    } else {
      items.push(child)
    }
  })

  return (
    <AccordionContext.Provider value={{ allowMultiple, openIndices, toggle }}>
      <div className="not-prose my-4 border border-border rounded-md overflow-hidden">
        {items}
      </div>
    </AccordionContext.Provider>
  )
}
