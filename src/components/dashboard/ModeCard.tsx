'use client'

import React from 'react'
import {
  Play,
  ArrowCounterClockwise,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ModeCardProps {
  title: string
  subtitle?: string
  description: string
  icon: PhosphorIcon
  accentColor: string
  primaryActionLabel: string
  onPrimaryAction: () => void
  onSecondaryAction?: () => void
  hasActiveSession?: boolean
  disabled?: boolean
  sessionCount?: number
  lastPlayedAt?: string | null
  muted?: boolean
}

const formatTimeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function ModeCard({
  title,
  subtitle,
  description,
  icon: Icon,
  accentColor,
  primaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  hasActiveSession,
  disabled,
  sessionCount,
  lastPlayedAt,
  muted,
}: ModeCardProps) {
  return (
    <Card
      size='lg'
      className={cn(
        'relative h-full rounded-md transition-all duration-150 hover:border-primary/20 hover:shadow-sm',
        disabled && 'opacity-60 grayscale pointer-events-none',
        muted && 'opacity-70',
      )}
    >
      {/* Icon Header */}
      <div className='flex items-center gap-4 mb-4'>
        <div
          className={cn(
            'w-12 h-12 rounded-md flex items-center justify-center shrink-0',
            accentColor,
          )}
        >
          <SCIcon icon={Icon} size='lg' className='text-white' />
        </div>
        <div className='min-w-0'>
          <h3 className='text-sm font-semibold text-text-primary leading-tight'>{title}</h3>
          {subtitle && (
            <Eyebrow>{subtitle}</Eyebrow>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex-1'>
        <p className='text-sm text-text-secondary leading-relaxed mb-4 line-clamp-2'>
          {description}
        </p>
      </div>

      {/* Micro-stats */}
      {(sessionCount !== undefined && sessionCount > 0) && (
        <div className='mb-4 pb-3 border-b border-border/60'>
          <p className='text-[11px] text-text-tertiary font-medium'>
            {sessionCount} session{sessionCount !== 1 ? 's' : ''}
            {lastPlayedAt && <> &middot; Last: {formatTimeAgo(lastPlayedAt)}</>}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className='flex flex-col gap-2 mt-auto'>
        <Button
          onClick={onPrimaryAction}
          className={cn(
            'w-full font-semibold transition-all',
            hasActiveSession
              ? 'bg-muted text-foreground hover:bg-muted/80'
              : 'bg-primary text-white hover:bg-primary-700',
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
            className='w-full border-primary/20 text-primary hover:bg-primary-50 font-semibold'
          >
            <SCIcon icon={Play} size='sm' weight='fill' className='mr-2' />{' '}
            Resume Session
          </Button>
        )}
      </div>

      {/* Status Badge */}
      {hasActiveSession && (
        <Badge
          variant='primary'
          size='xs'
          className='absolute top-4 right-4 rounded-md font-bold'
        >
          In Progress
        </Badge>
      )}
    </Card>
  )
}
