'use client'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { HelpCircle } from 'lucide-react'

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
          <HelpCircle className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
        </span>
      </PopoverTrigger>
      <PopoverContent side="top" align="end" className="w-72 p-0 rounded-sm border-zinc-200 shadow-xl overflow-hidden">
        {mediaUrl && (
          <div className="w-full h-32 bg-zinc-100 flex items-center justify-center border-b border-zinc-100">
            {/* Placeholder for GIF/Video */}
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Media Placeholder</span>
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
