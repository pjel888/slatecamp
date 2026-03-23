'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface QuestionStemProps {
  text: string
  imageUrl?: string | null
  className?: string
}

export function QuestionStem({ text, imageUrl, className }: QuestionStemProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  const openLightbox = () => setIsLightboxOpen(true)
  const closeLightbox = useCallback(() => setIsLightboxOpen(false), [])

  useEffect(() => {
    if (!isLightboxOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLightboxOpen, closeLightbox])

  // Reset state when imageUrl changes
  useEffect(() => {
    setIsLoaded(false)
    setHasError(false)
  }, [imageUrl])

  return (
    <div className={cn('space-y-4', className)}>
      {imageUrl && !hasError && (
        <div className="rounded-md overflow-hidden border border-[#D4DAE3] bg-[#F5F5F5]">
          {!isLoaded && (
            <div className="animate-pulse bg-[#D4DAE3]/30 h-[200px]" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Question reference material"
            loading="lazy"
            className={cn(
              'w-full max-h-[240px] object-contain cursor-zoom-in transition-opacity duration-200',
              isLoaded ? 'opacity-100' : 'opacity-0 absolute'
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            onClick={openLightbox}
          />
        </div>
      )}

      <p
        className="text-[16px] font-normal text-[#1A2332] leading-[1.7] tracking-tight max-w-[65ch] selection:bg-[#EEF2FC] selection:text-[#1535A8]"
      >
        {text}
      </p>

      {isLightboxOpen && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full w-9 h-9 flex items-center justify-center transition-colors"
            onClick={closeLightbox}
            aria-label="Close image"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Image — stop propagation so clicking the image itself doesn't close */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Question reference material"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-md shadow-2xl cursor-zoom-out"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
