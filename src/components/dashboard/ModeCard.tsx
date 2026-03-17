'use client'

import React from 'react'
import {
  type Icon as PhosphorIcon,
  Play,
  ArrowCounterClockwise,
} from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModeCardProps {
  title: string
  description: string
  icon: PhosphorIcon
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
        'group relative bg-white border border-border rounded-md p-6 transition-all duration-150 hover:shadow-sm hover:border-primary/20 flex flex-col h-full',
        disabled && 'opacity-60 grayscale pointer-events-none',
      )}
    >
      {/* Icon Header */}
      <div
        className={cn(
          'w-12 h-12 rounded-md flex items-center justify-center mb-6',
          accentColor,
        )}
      >
        <SCIcon icon={Icon} size='lg' className='text-white' />
      </div>

      {/* Content */}
      <div className='flex-1'>
        <h3 className='text-sm font-semibold text-[#1A2332] mb-2'>{title}</h3>
        <p className='text-sm text-[#4A5568] leading-relaxed mb-6'>
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className='flex flex-col gap-2 mt-auto'>
        <Button
          onClick={onPrimaryAction}
          className={cn(
            'w-full font-semibold transition-all',
            hasActiveSession
              ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
              : 'bg-primary text-white hover:bg-[#1535A8]',
          )}
        >
          {hasActiveSession ? (
            <>
              <SCIcon icon={ArrowCounterClockwise} size='sm' className='mr-2' />{' '}
              Start Fresh
            </>
          ) : (
            primaryActionLabel
          )}
        </Button>

        {hasActiveSession && onSecondaryAction && (
          <Button
            variant='outline'
            onClick={onSecondaryAction}
            className='w-full border-primary/20 text-primary hover:bg-[#EEF2FC] font-semibold'
          >
            <SCIcon icon={Play} size='sm' weight='fill' className='mr-2' />{' '}
            Resume Session
          </Button>
        )}
      </div>

      {/* Status Badge */}
      {hasActiveSession && (
        <div className='absolute top-4 right-4 bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-md'>
          In Progress
        </div>
      )}
    </div>
  )
}
