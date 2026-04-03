'use client'

import React from 'react'
import { Mermaid } from './Mermaid'

interface WikiCodeBlockProps {
  children: React.ReactNode
  [key: string]: any
}

export const WikiCodeBlock = ({ children, ...props }: WikiCodeBlockProps) => {
  // Inspect children to see if it's a mermaid block
  // MDX renders: pre > code.language-mermaid
  const childrenArray = React.Children.toArray(children)
  const codeElement = childrenArray.find(
    (child: any) => child?.type === 'code' || child?.props?.mdxType === 'code'
  ) as any

  if (codeElement?.props?.className === 'language-mermaid') {
    const chart = codeElement.props.children
    if (typeof chart === 'string') {
      return <Mermaid chart={chart} />
    }
  }

  return (
    <pre
      className="not-prose my-6 overflow-x-auto rounded-md bg-zinc-950 text-zinc-100 p-4 text-[13px] leading-relaxed font-mono border border-zinc-800"
      {...props}
    >
      {children}
    </pre>
  )
}
