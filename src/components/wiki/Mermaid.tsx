'use client'

import React, { useEffect, useRef, useState, useId, useMemo } from 'react'
import mermaid from 'mermaid'
import { useTheme } from 'next-themes'

interface MermaidProps {
  chart: string
}

export const Mermaid = ({ chart }: MermaidProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const { theme, resolvedTheme } = useTheme()
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Use React useId for stable hydration-safe IDs
  const uniqueId = useId()
  const id = useMemo(() => `mermaid-${uniqueId.replace(/:/g, '')}`, [uniqueId])

  useEffect(() => {
    const isDark = (theme || resolvedTheme) === 'dark'
    
    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'var(--font-inter)',
    })

    const renderChart = async () => {
      if (!ref.current) return
      
      try {
        setError(null)
        // Cleanup previous content
        ref.current.innerHTML = ''
        
        // Use mermaid.render instead of mermaid.contentLoaded
        const { svg: renderedSvg } = await mermaid.render(id, chart)
        setSvg(renderedSvg)
      } catch (err) {
        console.error('Mermaid rendering failed:', err)
        setError('Failed to render diagram. Please check your Mermaid syntax.')
      }
    }

    renderChart()
  }, [chart, theme, resolvedTheme, id])

  if (error) {
    return (
      <div className="my-6 p-4 rounded-md border border-red-200 bg-red-50 text-red-800 text-xs font-mono">
        <p className="font-semibold mb-1">Mermaid Syntax Error</p>
        <pre className="whitespace-pre-wrap">{error}</pre>
        <details className="mt-2">
          <summary className="cursor-pointer opacity-70">View Source</summary>
          <pre className="mt-2 p-2 bg-red-100/50 rounded overflow-x-auto">{chart}</pre>
        </details>
      </div>
    )
  }

  return (
    <div className="not-prose my-8 flex justify-center w-full overflow-x-auto bg-white/50 dark:bg-zinc-900/30 rounded-lg p-6 border border-border/40">
      <div 
        ref={ref} 
        className="mermaid w-full max-w-4xl"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
}
