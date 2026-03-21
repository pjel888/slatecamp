'use client'

import { useState, Children, isValidElement, type ReactNode } from 'react'

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

  if (tabs.length === 0) return null

  return (
    <div className="not-prose my-5 border border-[#E0DED8] rounded-[10px] overflow-hidden bg-white dark:bg-[#1A1A1A] dark:border-[#3A3835]">
      {/* Tab bar */}
      <div className="flex border-b border-[#E0DED8] bg-[#F2F0EB] dark:bg-[#252420] dark:border-[#3A3835]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`font-[var(--font-dm-mono)] text-xs font-medium px-5 py-2.5 border-b-2 -mb-px transition-all duration-150 ${
              activeTab === tab.value
                ? 'text-[#1B3FC4] border-[#1B3FC4] bg-white dark:bg-[#1A1A1A]'
                : 'text-[#737370] border-transparent hover:text-[#1A1A1A] dark:text-[#A8A8A5] dark:hover:text-[#E2E0D8]'
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
          className={`px-5 py-[18px] ${activeTab === tab.value ? 'block' : 'hidden'}`}
        >
          <div className="text-sm text-[#3D3D3A] leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 dark:text-[#C8C6C0]">
            {tab.content}
          </div>
        </div>
      ))}
    </div>
  )
}
