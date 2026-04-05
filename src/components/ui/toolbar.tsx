import { cn } from '@/lib/utils'

type ToolbarProps = React.ComponentProps<'div'>

type ToolbarGroupProps = React.ComponentProps<'div'>

type ToolbarDividerProps = React.ComponentProps<'div'>

const Toolbar = ({ className, ...props }: ToolbarProps) => (
  <div data-slot="toolbar" className={cn('flex items-center gap-1', className)} {...props} />
)

const ToolbarGroup = ({ className, ...props }: ToolbarGroupProps) => (
  <div data-slot="toolbar-group" className={cn('flex items-center gap-0.5', className)} {...props} />
)

const ToolbarDivider = ({ className, ...props }: ToolbarDividerProps) => (
  <div
    aria-hidden="true"
    data-slot="toolbar-divider"
    className={cn('mx-1 h-5 w-px bg-border', className)}
    {...props}
  />
)

export { Toolbar, ToolbarGroup, ToolbarDivider }
export type { ToolbarProps, ToolbarGroupProps, ToolbarDividerProps }
