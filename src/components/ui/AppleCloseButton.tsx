'use client'

import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppleCloseButtonProps {
  onClick: () => void
  className?: string
}

/**
 * A premium, Apple-style red "traffic light" close button.
 * Hover reveals a tiny X.
 */
export function AppleCloseButton({ onClick, className }: AppleCloseButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E] flex items-center justify-center group/close hover:brightness-90 transition-all shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]",
        className
      )}
      title="Close"
    >
      <X 
        className="h-2 w-2 text-[#4C0000] opacity-0 group-hover/close:opacity-100 transition-opacity" 
        strokeWidth={4} 
      />
    </button>
  )
}
