'use client'

import { useEffect, useState } from 'react'

interface LabLoadingStateProps {
  moduleName: string
  progress: number
  tips: string[]
}

export const LabLoadingState = ({
  moduleName,
  progress,
  tips,
}: LabLoadingStateProps) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [tipVisible, setTipVisible] = useState(true)
  const [showFallback, setShowFallback] = useState(false)

  // Cycle tips every 4 seconds with a fade transition
  useEffect(() => {
    if (tips.length <= 1) return
    const interval = setInterval(() => {
      setTipVisible(false)
      setTimeout(() => {
        setCurrentTipIndex((prev) => (prev + 1) % tips.length)
        setTipVisible(true)
      }, 200)
    }, 4000)
    return () => clearInterval(interval)
  }, [tips])

  // Show 2D fallback after 8 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  const currentTip = tips[currentTipIndex] ?? ''

  return (
    <div
      className="flex flex-col items-center justify-center w-full h-full relative"
      style={{ backgroundColor: '#F2F0EB' }}
    >
      {/* Cobalt spinner */}
      <div
        className="animate-spin rounded-full mb-4"
        style={{
          width: '24px',
          height: '24px',
          border: '2px solid #EEF2FC',
          borderTopColor: '#1B3FC4',
        }}
      />

      {/* Module name */}
      <span
        className="mb-3"
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          color: '#8896A7',
          letterSpacing: '0.04em',
        }}
      >
        {moduleName}
      </span>

      {/* Progress percentage */}
      <span
        className="mb-5"
        style={{
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          color: '#8896A7',
        }}
      >
        {Math.round(progress)}%
      </span>

      {/* Rotating tip */}
      {currentTip && (
        <p
          className="text-center max-w-xs px-6"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            color: '#4A5568',
            lineHeight: '1.5',
            opacity: tipVisible ? 1 : 0,
            transition: 'opacity 200ms ease-out',
          }}
        >
          {currentTip}
        </p>
      )}

      {/* 2D fallback button — appears after 8 seconds */}
      {showFallback && (
        <button
          className="mt-6 bg-transparent border-0 cursor-pointer p-0 transition-colors duration-150 ease-out"
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '11px',
            color: '#1B3FC4',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = '#1535A8'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.color = '#1B3FC4'
          }}
        >
          View as 2D →
        </button>
      )}

      {/* Accelerating progress bar — full width, 2px, bottom of container */}
      <div
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '2px', backgroundColor: '#EEF2FC' }}
      >
        <div
          style={{
            height: '2px',
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: '#1B3FC4',
            transition: 'width 300ms ease-out',
          }}
        />
      </div>
    </div>
  )
}
