'use client'
import { type IconWeight, type Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import { cn } from '@/lib/utils'

export type IconSize = 'base' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

const sizeMap: Record<IconSize, number> = {
  base: 16,
  xs: 14,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48,
}

interface SCIconProps {
  icon: PhosphorIcon
  size?: IconSize
  color?: string
  weight?: IconWeight
  className?: string
  ariaLabel?: string
}

export function SCIcon({
  icon: IconComponent,
  size = 'md',
  color = 'currentColor',
  weight = 'regular',
  className,
  ariaLabel,
}: SCIconProps) {
  return (
    <IconComponent
      size={sizeMap[size]}
      color={color}
      weight={weight}
      className={cn(className)}
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
    />
  )
}
