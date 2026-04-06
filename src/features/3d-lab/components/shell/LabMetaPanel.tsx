'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LabMetaPanelProps {
  children: React.ReactNode
  title?: string
  className?: string
}

/**
 * LabMetaPanel — Consistent panel container for module metadata and contextual info.
 * Usually positioned as an overlay on the viewport.
 */
export const LabMetaPanel = ({ children, title, className = '' }: LabMetaPanelProps) => {
  return (
    <Card className={cn(
      "bg-white/95 backdrop-blur-md border-border-default/50 shadow-xl pointer-events-auto overflow-hidden rounded-lg",
      className
    )}>
      {title && (
        <div className="px-4 py-2 border-b border-border-default/30 bg-muted/30">
          <h4 className="font-mono text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-none">
            {title}
          </h4>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </Card>
  )
}
