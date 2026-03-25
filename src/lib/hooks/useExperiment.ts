'use client'
import { useMemo } from 'react'
import { getVariant, EXPERIMENTS } from '@/lib/experiments'

export const useExperiment = (experimentId: keyof typeof EXPERIMENTS, userId: string) => {
  const experiment = EXPERIMENTS[experimentId]
  const variant = useMemo(
    () => experiment.active ? getVariant(userId, experiment.id, [...experiment.variants]) : experiment.variants[0],
    [userId, experiment]
  )
  return { variant, isActive: experiment.active }
}
