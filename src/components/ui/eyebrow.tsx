import { cn } from '@/lib/utils'

type EyebrowProps = React.ComponentProps<'span'>

const Eyebrow = ({ className, ...props }: EyebrowProps) => (
  <span
    data-slot="eyebrow"
    className={cn(
      'font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground',
      className,
    )}
    {...props}
  />
)

export { Eyebrow }
export type { EyebrowProps }
