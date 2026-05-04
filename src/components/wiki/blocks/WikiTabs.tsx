'use client'

import { useState, Children, isValidElement, useCallback, type ReactNode } from 'react'

interface TabProps {
  label: string
  value: string
  children: ReactNode
}

export const Tab = ({ children }: TabProps) => <>{children}</>

interface TabsProps {
  defaultTab?: string
  children: ReactNode
}

export const Tabs = ({ defaultTab, children }: TabsProps) => {
  const tabs: { label: string; value: string; content: ReactNode }[] = []

  Children.forEach(children, (child) => {
    if (isValidElement(child) && (child.type === Tab || (child.props as any)?.label)) {
      const props = child.props as TabProps
      tabs.push({ label: props.label, value: props.value, content: props.children })
    }
  })

  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.value || '')

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex((t) => t.value === activeTab)
    let nextIndex: number | null = null

    if (e.key === 'ArrowLeft') {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1
    } else if (e.key === 'ArrowRight') {
      nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0
    }

    if (nextIndex !== null) {
      e.preventDefault()
      setActiveTab(tabs[nextIndex].value)
      // Focus the next tab button
      const nextButton = document.getElementById(`tab-${tabs[nextIndex].value}`)
      nextButton?.focus()
    }
  }, [activeTab, tabs])

  if (tabs.length === 0) return null

  return (
    <div className="not-prose my-5 border border-border rounded-md overflow-hidden bg-background">
      {/* Tab bar */}
      <div role="tablist" aria-orientation="horizontal" onKeyDown={handleKeyDown} className="flex border-b border-border bg-muted">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.value}
            aria-controls={`tabpanel-${tab.value}`}
            id={`tab-${tab.value}`}
            onClick={() => setActiveTab(tab.value)}
            className={`font-[var(--font-dm-mono)] text-xs font-medium px-5 py-2.5 border-b-2 -mb-px transition-all duration-150 ${
              activeTab === tab.value
                ? 'text-primary border-primary bg-background'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <div
          key={tab.value}
          role="tabpanel"
          id={`tabpanel-${tab.value}`}
          aria-labelledby={`tab-${tab.value}`}
          hidden={activeTab !== tab.value}
          className="px-5 py-[18px]"
        >
          <div className="text-sm text-foreground leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0">
            {tab.content}
          </div>
        </div>
      ))}
    </div>
  )
}
