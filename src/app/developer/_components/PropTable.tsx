import { cn } from '@/lib/utils'

interface PropDef {
  name: string
  type: string
  default?: string
  required?: boolean
  description?: string
}

interface PropTableProps {
  props: PropDef[]
  className?: string
}

export const PropTable = ({ props, className }: PropTableProps) => (
  <div className={cn('overflow-hidden rounded-xs border border-border my-3', className)}>
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-border bg-muted">
          <th className="px-2.5 py-1.5 text-left font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Prop
          </th>
          <th className="px-2.5 py-1.5 text-left font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Type
          </th>
          <th className="px-2.5 py-1.5 text-left font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Default
          </th>
          <th className="px-2.5 py-1.5 text-center font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Req
          </th>
        </tr>
      </thead>
      <tbody>
        {props.map((prop) => (
          <tr key={prop.name} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
            <td className="px-2.5 py-1.5 font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-primary">
              {prop.name}
            </td>
            <td className="px-2.5 py-1.5 font-[family-name:var(--font-dm-mono)] text-[10px] text-muted-foreground">
              {prop.type}
            </td>
            <td className="px-2.5 py-1.5 font-[family-name:var(--font-dm-mono)] text-[10px] text-muted-foreground">
              {prop.default ?? '—'}
            </td>
            <td className="px-2.5 py-1.5 text-center text-[10px]">
              {prop.required ? (
                <span className="text-emerald-500">●</span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
