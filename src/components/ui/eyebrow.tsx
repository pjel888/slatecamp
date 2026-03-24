import { cn } from '@/lib/utils'

interface EyebrowProps {
  children: React.ReactNode
  className?: string
}

export const Eyebrow = ({ children, className }: EyebrowProps) => (
  <span
    className={cn(
      'font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground',
      className,
    )}
  >
    {children}
  </span>
)
