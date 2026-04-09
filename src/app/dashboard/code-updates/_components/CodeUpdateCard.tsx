import Link from 'next/link'
import type { CodeUpdate } from '@/lib/actions/code-updates'
import { ROUTES } from '@/lib/routes'

interface CodeUpdateCardProps {
  update: CodeUpdate
}

const formatEffectiveDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export const CodeUpdateCard = ({ update }: CodeUpdateCardProps) => {
  const {
    code_name,
    summary,
    previous_value,
    new_value,
    effective_date,
    is_lea_testable,
    lea_id,
  } = update

  return (
    <div className="rounded-md border border-border bg-card px-5 py-4 shadow-none">
      {/* Header row */}
      <div className="flex items-start gap-2 mb-3">
        <span className="font-mono text-[9px] bg-primary-50 text-primary px-1.5 py-0.5 rounded-sm shrink-0 leading-tight tracking-wide uppercase">
          {code_name}
        </span>
        {is_lea_testable && (
          <span className="font-mono text-[9px] bg-success-50 text-success px-1.5 py-0.5 rounded-sm shrink-0 leading-tight tracking-wide uppercase">
            LEA-testable
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm text-foreground leading-relaxed mb-3">{summary}</p>

      {/* Value change */}
      {(previous_value || new_value) && (
        <div className="flex flex-col gap-1 mb-3 pl-3 border border-border rounded-sm">
          {previous_value && (
            <p className="text-xs text-muted-foreground line-through">{previous_value}</p>
          )}
          {new_value && (
            <p className="text-xs font-semibold text-foreground">{new_value}</p>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          {effective_date && (
            <span className="text-xs text-muted-foreground">
              Effective {formatEffectiveDate(effective_date)}
            </span>
          )}
        </div>
        {lea_id && (
          <Link
            href={`${ROUTES.WIKI_PAGE(lea_id.toLowerCase().replace(/\s+/g, '-'))}`}
            className="text-xs text-primary hover:underline"
          >
            View wiki article →
          </Link>
        )}
      </div>
    </div>
  )
}
