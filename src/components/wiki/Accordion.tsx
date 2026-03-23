'use client'

import { useState, Children, isValidElement, type ReactNode } from 'react'

interface AccordionItemProps {
  title: string
  children: ReactNode
}

export function AccordionItem({ children }: AccordionItemProps) {
  return <>{children}</>
}

export function Accordion({ children }: { children: ReactNode }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const items: { title: string; content: ReactNode }[] = []
  Children.forEach(children, (child) => {
    if (isValidElement<AccordionItemProps>(child) && child.props.title) {
      items.push({ title: child.props.title, content: child.props.children })
    }
  })

  return (
    <div className="not-prose my-4 border border-[#E0DED8] rounded-[10px] overflow-hidden">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i} className={i < items.length - 1 ? 'border-b border-[#ECEAE4]' : ''}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex justify-between items-center py-[14px] px-[18px] bg-white hover:bg-[#F5F5F5] transition-colors duration-150 text-left"
            >
              <span className="text-[14px] font-semibold text-[#1A1A1A]">{item.title}</span>
              <span className={`text-[12px] text-[#A8A8A5] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            <div className={`px-[18px] pb-4 ${isOpen ? 'block' : 'hidden'}`}>
              <div className="text-[13px] text-[#3D3D3A] leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
