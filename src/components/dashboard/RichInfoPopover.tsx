'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Question } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface RichInfoPopoverProps {
  title: string
  description: string
  mediaUrl?: string
}

export const RichInfoPopover = ({ title, description, mediaUrl }: RichInfoPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <span className="absolute top-2 right-2 p-1 focus:outline-none group cursor-pointer">
          <SCIcon icon={Question} size="xs" className="text-zinc-300 group-hover:text-zinc-500 transition-colors" />
        </span>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-72 p-0 rounded-md border-border shadow-lg overflow-hidden">
        {mediaUrl && (
          <div className="w-full h-32 bg-muted flex items-center justify-center border-b border-border">
            {/* Placeholder for GIF/Video */}
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Media Placeholder</span>
          </div>
        )}
        <div className="p-4">
          <h4 className="text-[13px] font-bold text-zinc-900 leading-none">{title}</h4>
          <p className="mt-2 text-[12px] text-zinc-500 leading-relaxed">
            {description}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
