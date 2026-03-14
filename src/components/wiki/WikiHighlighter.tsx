'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Client component that handles highlighting and scrolling to a specific term
 * passed via the 'highlight' query parameter.
 */
export function WikiHighlighter() {
  const searchParams = useSearchParams()
  const highlight = searchParams.get('highlight')

  useEffect(() => {
    if (!highlight) return

    // Small delay to ensure MDX content is fully rendered in the DOM
    const timer = setTimeout(() => {
      const term = highlight.toLowerCase()
      
      // Find all text nodes in the article content area
      const article = document.querySelector('article')
      if (!article) return

      const walker = document.createTreeWalker(
        article,
        NodeFilter.SHOW_TEXT,
        null
      )

      let node: Node | null
      while ((node = walker.nextNode())) {
        const text = node.textContent?.toLowerCase() || ''
        const index = text.indexOf(term)

        if (index !== -1) {
          // Found the term! Now wrap it in a highlight span.
          const range = document.createRange()
          range.setStart(node, index)
          range.setEnd(node, index + term.length)

          const span = document.createElement('span')
          span.className = 'highlight-fade'
          span.style.backgroundColor = 'rgba(37, 99, 235, 0.15)'
          span.style.borderRadius = '2px'
          span.style.padding = '0 2px'
          
          range.surroundContents(span)

          // Scroll to the highlighted element
          span.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })

          // Remove the class after animation
          setTimeout(() => {
            span.style.backgroundColor = 'transparent'
          }, 3000)

          break // Only highlight the first instance
        }
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [highlight])

  return null
}
