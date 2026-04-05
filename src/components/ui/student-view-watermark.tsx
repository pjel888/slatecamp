import { cn } from '@/lib/utils'

interface StudentViewWatermarkProps
  extends Omit<React.ComponentProps<'div'>, 'children'> {
  label?: React.ReactNode
}

const StudentViewWatermark = ({
  label = 'Student View â€” This is exactly what students see',
  className,
  ...props
}: StudentViewWatermarkProps) => (
  <div
    data-slot="student-view-watermark"
    className={cn('shrink-0 border-b border-amber-200 bg-warning-50 px-4 py-1.5', className)}
    {...props}
  >
    <span
      data-slot="student-view-watermark-label"
      className="font-mono text-[11px] font-medium uppercase tracking-wider text-amber-700"
    >
      {label}
    </span>
  </div>
)

export { StudentViewWatermark }
export type { StudentViewWatermarkProps }
