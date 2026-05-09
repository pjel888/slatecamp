import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'
import { SlateCampLogomark } from '@/components/graphics/logos/SlateCampLogomark'

type LogoSize = 'sm' | 'md' | 'lg' | 'xl'

type LogoVariant = 'default' | 'monochrome' | 'inverted' | 'landing'

export interface LogoProps extends Omit<React.ComponentProps<'div'>, 'children'> {
  size?: LogoSize
  variant?: LogoVariant
  showText?: boolean
}

const ICON_SIZES: Record<LogoSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

const logoTextVariants = cva(
  'inline-flex items-baseline gap-[1px] font-semibold leading-none logo-sora',
  {
    variants: {
      size: {
        sm: 'text-[13px]',
        md: 'text-[15px]',
        lg: 'text-[17px]',
        xl: 'text-[20px]',
      },
      variant: {
        default: '',
        monochrome: '',
        inverted: 'text-white',
        landing: 'text-slate-950',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  },
)

export const SlateCampLogo = ({
  className,
  size = 'md',
  variant = 'default',
  showText = true,
  style,
  ...props
}: LogoProps) => {
  const iconSize = ICON_SIZES[size]

  const isInverted = variant === 'inverted'
  const isLanding = variant === 'landing'

  // User requested: pure cobalt blue (#012dcc)
  const COBALT_HEX = '#012dcc'
  
  // Apply direct style if not inverted to ensure the specific hex is used
  const logoStyle = !isInverted ? { color: COBALT_HEX } : {}
  const mergedStyle = { ...style, ...logoStyle }
  const logoColorClass = isInverted ? 'text-white' : ''

  return (
    <div className={cn('inline-flex items-center gap-2', className)} style={mergedStyle} {...props}>
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
            logoTextVariants({ size, variant }),
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
