import { cn } from '@/lib/utils'

interface ToolbarProps {
  children: React.ReactNode
  className?: string
}

interface ToolbarGroupProps {
  children: React.ReactNode
  className?: string
}

interface ToolbarDividerProps {
  className?: string
}

export const Toolbar = ({ children, className }: ToolbarProps) => (
  <div className={cn('flex items-center gap-1', className)}>{children}</div>
)

export const ToolbarGroup = ({ children, className }: ToolbarGroupProps) => (
  <div className={cn('flex items-center gap-0.5', className)}>{children}</div>
)

export const ToolbarDivider = ({ className }: ToolbarDividerProps) => (
  <div className={cn('w-px h-5 bg-border mx-1', className)} />
)
