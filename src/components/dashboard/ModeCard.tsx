'use client'

import React from 'react'
import { LucideIcon, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModeCardProps {
  title: string
  description: string
  icon: LucideIcon
  accentColor: string
  primaryActionLabel: string
  onPrimaryAction: () => void
  onSecondaryAction?: () => void
  hasActiveSession?: boolean
  disabled?: boolean
}

export function ModeCard({
  title,
  description,
  icon: Icon,
  accentColor,
  primaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  hasActiveSession,
  disabled,
}: ModeCardProps) {
  return (
    <div
      className={cn(
        'group relative bg-white border border-zinc-200 rounded-sm p-6 transition-all duration-150 hover:shadow-sm hover:border-zinc-300 flex flex-col h-full',
        disabled && 'opacity-60 grayscale pointer-events-none',
      )}
    >
      {/* Icon Header */}
      <div
        className={cn(
          'w-12 h-12 rounded-sm flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110',
          accentColor,
        )}
      >
        <Icon className='h-6 w-6 text-white' />
      </div>

      {/* Content */}
      <div className='flex-1'>
        <h3 className='text-lg font-bold text-zinc-900 mb-2'>{title}</h3>
        <p className='text-sm text-zinc-500 leading-relaxed mb-6'>
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className='flex flex-col gap-2 mt-auto'>
        <Button
          onClick={onPrimaryAction}
          className={cn(
            'w-full font-semibold shadow-sm transition-all rounded-sm',
            hasActiveSession
              ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
              : 'bg-blue-600 text-white hover:bg-blue-700',
          )}
        >
          {hasActiveSession ? (
            <>
              <RotateCcw className='mr-2 h-4 w-4' /> Start Fresh
            </>
          ) : (
            primaryActionLabel
          )}
        </Button>

        {hasActiveSession && onSecondaryAction && (
          <Button
            variant='outline'
            onClick={onSecondaryAction}
            className='w-full border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold rounded-sm'
          >
            <Play className='mr-2 h-4 w-4 fill-current' /> Resume Session
          </Button>
        )}
      </div>

      {/* Status Badge */}
      {hasActiveSession && (
        <div className='absolute top-4 right-4 bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm'>
          In Progress
        </div>
      )}
    </div>
  )
}
