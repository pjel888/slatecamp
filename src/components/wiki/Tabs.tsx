'use client'

import { useState, Children, isValidElement, type ReactNode } from 'react'

interface TabProps {
  label: string
  value: string
  children: ReactNode
}

export function Tab({ children }: TabProps) {
  return <>{children}</>
}

interface TabsProps {
  defaultTab: string
  children: ReactNode
}

export function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const tabs: { label: string; value: string; content: ReactNode }[] = []
  Children.forEach(children, (child) => {
    if (isValidElement<TabProps>(child) && child.props.value) {
      tabs.push({
        label: child.props.label,
        value: child.props.value,
        content: child.props.children,
      })
    }
  })

  return (
    <div className="not-prose my-5 border border-[#E0DED8] rounded-[10px] overflow-hidden bg-white">
      <div className="flex border-b border-[#E0DED8] bg-[#F5F5F5]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`font-[family-name:var(--font-dm-mono)] text-[12px] font-medium py-[10px] px-5 border-b-2 -mb-px transition-all duration-150 ${
              activeTab === tab.value
                ? 'text-camp-cobalt border-camp-cobalt bg-white'
                : 'text-[#737370] border-transparent hover:text-[#1A1A1A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.value}
          className={`py-[18px] px-5 ${activeTab === tab.value ? 'block' : 'hidden'}`}
        >
          {tab.content}
        </div>
      ))}
    </div>
  )
}
