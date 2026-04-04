import { cn } from '@/lib/utils'
import { SlateCampLogomark } from '@/components/graphics/logos/SlateCampLogomark'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

type LogoVariant = 'default' | 'monochrome' | 'inverted' | 'landing'

export interface LogoProps {
  className?: string
  size?: LogoSize
  variant?: LogoVariant
  showText?: boolean
}

const SIZE_CLASSES: Record<LogoSize, string> = {
  sm: 'text-[13px]',
  md: 'text-[15px]',
  lg: 'text-[17px]',
  xl: 'text-[20px]',
}

const ICON_SIZES: Record<LogoSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

export const SlateCampLogo = ({
  className,
  size = 'md',
  variant = 'default',
  showText = true,
}: LogoProps) => {
  const sizeClass = SIZE_CLASSES[size]
  const iconSize = ICON_SIZES[size]

  const isInverted = variant === 'inverted'
  const isLanding = variant === 'landing'

  // User requested: pure cobalt blue (#012dcc)
  const COBALT_HEX = '#012dcc'
  
  // Apply direct style if not inverted to ensure the specific hex is used
  const logoStyle = !isInverted ? { color: COBALT_HEX } : {}
  const logoColorClass = isInverted ? 'text-white' : ''

  return (
    <div className={cn('inline-flex items-center gap-2', className)} style={logoStyle}>
      <SlateCampLogomark
        size={iconSize}
        className={logoColorClass}
      />
      
      {isLanding && (
        <span 
          className={cn("h-4 w-px mx-1.5 opacity-20", isInverted ? "bg-white" : "")} 
          style={!isInverted ? { backgroundColor: COBALT_HEX } : {}}
          aria-hidden='true' 
        />
      )}

      {showText && (
        <span
          className={cn(
            'inline-flex items-baseline gap-[1px] font-semibold leading-none logo-sora',
            sizeClass,
            logoColorClass
          )}
        >
          {isLanding ? (
            <span>SlateCamp 🇵🇭</span>
          ) : (
            <>
              <span>Slate</span>
              <span>Camp</span>
            </>
          )}
        </span>
      )}
    </div>
  )
}
