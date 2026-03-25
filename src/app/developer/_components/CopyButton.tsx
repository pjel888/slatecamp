'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  text: string
  className?: string
}

export const CopyButton = ({ text, className }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1 font-[family-name:var(--font-dm-mono)] text-[11px] px-1.5 py-0.5 rounded border transition-colors duration-150',
        copied
          ? 'text-emerald-400 border-emerald-500/30'
          : 'text-white/35 border-white/10 hover:text-white/70 hover:border-white/20',
        className,
      )}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}
