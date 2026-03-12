import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

type LogoVariant = 'default' | 'monochrome' | 'inverted'

export interface LogoProps {
  className?: string
  size?: LogoSize
  variant?: LogoVariant
}

const SIZE_CLASSES: Record<LogoSize, string> = {
  sm: 'text-[13px]',
  md: 'text-[15px]',
  lg: 'text-[17px]',
  xl: 'text-[20px]',
}

export const SlateCampLogo = ({
  className,
  size = 'md',
  variant = 'default',
}: LogoProps) => {
  const sizeClass = SIZE_CLASSES[size]

  const isDefault = variant === 'default'
  const isMonochrome = variant === 'monochrome'
  const isInverted = variant === 'inverted'

  const slateClass = cn(
    isInverted ? 'text-slatecamp-paper' : 'text-slatecamp-ink-main'
  )

  const campClass = cn(
    isDefault || isInverted
      ? isInverted
        ? 'text-slatecamp-paper'
        : 'text-slatecamp-amber'
      : 'text-slatecamp-ink-main'
  )

  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-[2px] font-semibold tracking-tight leading-none',
        sizeClass,
        className
      )}
    >
      <span className={slateClass}>Slate</span>
      <span className={campClass}>Camp</span>
    </span>
  )
}

