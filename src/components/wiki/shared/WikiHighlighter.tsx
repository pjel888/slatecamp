'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Client component that handles highlighting and scrolling to a specific term
 * passed via the 'highlight' query parameter.
 */
export function WikiHighlighter() {
  const searchParams = useSearchParams()
  const highlight = searchParams.get('highlight')

  React.useEffect(() => {
    if (!highlight) return

    let cancelled = false
    let fadeTimer: ReturnType<typeof setTimeout>

    // Poll with rAF until the article element has rendered content,
    // instead of using a fragile fixed timeout.
    const tryHighlight = () => {
      if (cancelled) return

      const article = document.querySelector('article')
      if (!article || !article.textContent?.trim()) {
        requestAnimationFrame(tryHighlight)
        return
      }

      const term = highlight.toLowerCase()

      const walker = document.createTreeWalker(
        article,
        NodeFilter.SHOW_TEXT,
        null,
      )

      let node: Node | null
      while ((node = walker.nextNode())) {
        const text = node.textContent?.toLowerCase() || ''
        const index = text.indexOf(term)

        if (index !== -1) {
          try {
            const range = document.createRange()
            range.setStart(node, index)
            range.setEnd(node, index + term.length)

            const span = document.createElement('span')
            span.className = 'highlight-fade'
            span.style.backgroundColor = 'rgba(37, 99, 235, 0.15)'
            span.style.borderRadius = '2px'
            span.style.padding = '0 2px'

            range.surroundContents(span)

            span.scrollIntoView({ behavior: 'smooth', block: 'center' })

            fadeTimer = setTimeout(() => {
              span.style.backgroundColor = 'transparent'
            }, 3000)
          } catch {
            // surroundContents throws if range spans multiple elements — skip gracefully
          }
          break
        }
      }
    }

    requestAnimationFrame(tryHighlight)

    return () => {
      cancelled = true
      clearTimeout(fadeTimer)
    }
  }, [highlight])

  return null
}
