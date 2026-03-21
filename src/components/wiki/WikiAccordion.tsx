'use client'

import { useState, Children, isValidElement, type ReactNode } from 'react'

interface AccordionItemProps {
  title: string
  children: ReactNode
}

export const AccordionItem = ({ title, children }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[#ECEAE4] last:border-b-0 dark:border-[#3A3835]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-[18px] py-3.5 bg-white text-left text-sm font-semibold text-[#1A1A1A] transition-colors duration-150 hover:bg-[#F2F0EB] dark:bg-[#1A1A1A] dark:text-[#E2E0D8] dark:hover:bg-[#252420]"
      >
        {title}
        <span
          className={`text-xs text-[#A8A8A5] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-[18px] pb-4">
          <div className="text-[13px] text-[#3D3D3A] [&_p]:mb-2 [&_p:last-child]:mb-0 dark:text-[#C8C6C0]">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface AccordionProps {
  children: ReactNode
}

export const Accordion = ({ children }: AccordionProps) => {
  return (
    <div className="not-prose my-4 border border-[#E0DED8] rounded-[10px] overflow-hidden dark:border-[#3A3835]">
      {children}
    </div>
  )
}
