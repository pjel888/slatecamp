'use client'

import React from 'react'
import { Cube } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface LabEmptyStateProps {
  title: string
  description?: string
  icon?: any
}

/**
 * LabEmptyState — Standardized empty state for categories or module lists.
 */
export const LabEmptyState = ({ title, description, icon = Cube }: LabEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <SCIcon icon={icon} size="md" className="text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground max-w-xs mx-auto">
          {description}
        </p>
      )}
    </div>
  )
}
