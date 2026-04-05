'use client'

import { X, ArrowSquareOut } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface WikiSidePanelProps {
  url: string
  onClose: () => void
}

export const WikiSidePanel = ({ url, onClose }: WikiSidePanelProps) => {
  // Ensure the URL has the minimal param
  const minimalUrl = url.includes('?') 
    ? `${url}&minimal=true` 
    : `${url}?minimal=true`

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-[60] animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-label="Wiki reference"
        className={cn(
          'fixed right-0 top-0 bottom-0 z-[70] w-full max-w-2xl',
          'bg-white border-l border-border shadow-2xl',
          'flex flex-col',
          'animate-in slide-in-from-right duration-200 ease-out',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0 bg-surface-light">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h2 className="text-sm font-semibold text-foreground">Wiki Reference</h2>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={url}
              target="_blank"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              title="Open in full page"
            >
              <ArrowSquareOut size={18} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-sm',
                'text-muted-foreground hover:text-foreground hover:bg-border/20',
                'transition-colors duration-150 ease-out',
              )}
              aria-label="Close panel"
            >
              <X size={18} weight="bold" />
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 bg-white">
          <iframe
            src={minimalUrl}
            className="w-full h-full border-none"
            title="Wiki Content"
          />
        </div>
      </div>
    </>
  )
}
