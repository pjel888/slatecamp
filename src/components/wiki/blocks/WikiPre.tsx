'use client'

import React from 'react'
import { Mermaid } from './Mermaid'

/**
 * Enhanced Code Block handler (Client Component).
 * Safely inspects MDX children to detect and render Mermaid diagrams.
 * This avoids the 'enqueueModel' error by running on the client where
 * React.Children is fully supported on the serialized tree.
 */
export const WikiPre = (props: any) => {
  const children = props.children
  
  // MDX structure for code blocks: pre > code
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
      className="not-prose my-6 overflow-x-auto rounded-md bg-foreground text-background p-4 text-[13px] leading-relaxed font-mono border border-border"
      {...props}
    />
  )
}
