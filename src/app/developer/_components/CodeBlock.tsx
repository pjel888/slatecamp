'use client'

import { cn } from '@/lib/utils'
import { CopyButton } from './CopyButton'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  showLineNumbers?: boolean
  className?: string
}

export const CodeBlock = ({
  code,
  language,
  filename,
  showLineNumbers = false,
  className,
}: CodeBlockProps) => {
  const lines = code.split('\n')

  return (
    <div className={cn('rounded-xs border border-zinc-800 bg-zinc-950 overflow-hidden my-3', className)}>
      {/* Header */}
      {(language || filename) && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-white/[0.02]">
          <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-white/35 uppercase tracking-[0.06em]">
            {filename || language}
          </span>
          <CopyButton text={code} />
        </div>
      )}

      {/* Code */}
      <div className="overflow-x-auto">
        <pre className="p-3 text-[12px] leading-relaxed font-[family-name:var(--font-dm-mono)] text-zinc-100">
          {showLineNumbers ? (
            <table className="border-collapse">
              <tbody>
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td className="pr-4 text-right text-zinc-600 select-none align-top w-8">{i + 1}</td>
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

      {/* Copy button fallback when no header */}
      {!language && !filename && (
        <div className="absolute top-2 right-2">
          <CopyButton text={code} />
        </div>
      )}
    </div>
  )
}
