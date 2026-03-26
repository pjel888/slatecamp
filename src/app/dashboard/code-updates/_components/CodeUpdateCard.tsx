import Link from 'next/link'
import type { CodeUpdate } from '@/lib/actions/code-updates'
import { ROUTES } from '@/lib/constants/routes'

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
    is_ale_testable,
    ale_id,
  } = update

  return (
    <div className="rounded-md border border-[#D4DAE3] bg-white px-5 py-4 shadow-none">
      {/* Header row */}
      <div className="flex items-start gap-2 mb-3">
        <span className="font-mono text-[9px] bg-[#EEF2FC] text-[#1B3FC4] px-1.5 py-0.5 rounded-sm shrink-0 leading-tight tracking-wide uppercase">
          {code_name}
        </span>
        {is_ale_testable && (
          <span className="font-mono text-[9px] bg-[#EDFAF4] text-[#2D9F6F] px-1.5 py-0.5 rounded-sm shrink-0 leading-tight tracking-wide uppercase">
            ALE-testable
          </span>
        )}
      </div>

      {/* Summary */}
      <p className="text-sm text-[#1A2332] leading-relaxed mb-3">{summary}</p>

      {/* Value change */}
      {(previous_value || new_value) && (
        <div className="flex flex-col gap-1 mb-3 pl-3 border-l-2 border-[#D4DAE3]">
          {previous_value && (
            <p className="text-xs text-[#8896A7] line-through">{previous_value}</p>
          )}
          {new_value && (
            <p className="text-xs font-semibold text-[#1A2332]">{new_value}</p>
          )}
        </div>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          {effective_date && (
            <span className="text-xs text-[#4A5568]">
              Effective {formatEffectiveDate(effective_date)}
            </span>
          )}
        </div>
        {ale_id && (
          <Link
            href={`${ROUTES.WIKI_PAGE(ale_id.toLowerCase().replace(/\s+/g, '-'))}`}
            className="text-xs text-[#1B3FC4] hover:underline"
          >
            View wiki article →
          </Link>
        )}
      </div>
    </div>
  )
}
