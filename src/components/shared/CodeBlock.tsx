'use client'

import { CopyButton } from '@/components/portal/CopyButton'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  className?: string
}

const CodeBlock = ({
  code,
  language,
  filename,
  showLineNumbers = false,
  className,
}: CodeBlockProps) => {
  const lines = code.split('\n')

  return (
    <div className={cn('relative my-3 overflow-hidden rounded-xs border border-zinc-800 bg-zinc-950', className)}>
      {(language || filename) && (
        <div className="flex items-center justify-between border-b border-zinc-800 bg-white/[0.02] px-3 py-1.5">
          <span className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.06em] text-white/35">
            {filename || language}
          </span>
          <CopyButton text={code} />
        </div>
      )}

      <div className="overflow-x-auto">
        <pre className="p-3 font-[family-name:var(--font-dm-mono)] text-[12px] leading-relaxed text-zinc-100">
          {showLineNumbers ? (
            <table className="border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="w-8 select-none pr-4 text-right align-top text-zinc-600">{i + 1}</td>
                    <td className="whitespace-pre">{line}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>

      {!language && !filename && (
        <div className="absolute right-2 top-2">
          <CopyButton text={code} />
        </div>
      )}
    </div>
  )
}

export { CodeBlock }
export type { CodeBlockProps }
