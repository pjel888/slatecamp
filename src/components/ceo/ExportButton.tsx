'use client'

import { useState } from 'react'
import { DownloadSimple, Check, Copy } from '@phosphor-icons/react'
import { generateInvestorExport } from '@/lib/actions/ceo/export-actions'

export const ExportButton = () => {
  const [state, setState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleExport = async () => {
    setState('loading')
    setErrorMsg(null)

    const result = await generateInvestorExport()

    if (!result.success || !result.markdown) {
      setState('error')
      setErrorMsg(result.error ?? 'Export failed')
      setTimeout(() => setState('idle'), 3000)
      return
    }

    try {
      await navigator.clipboard.writeText(result.markdown)
      setState('copied')
      setTimeout(() => setState('idle'), 2500)
    } catch {
      setState('error')
      setErrorMsg('Clipboard write failed')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={state === 'loading'}
        className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 disabled:opacity-50 transition-colors duration-150"
        aria-label="Export investor update to clipboard"
      >
        {state === 'loading' && <DownloadSimple size={12} className="animate-pulse" />}
        {state === 'copied' && <Check size={12} className="text-success" />}
        {state === 'error' && <Copy size={12} className="text-destructive" />}
        {state === 'idle' && <DownloadSimple size={12} />}
        {state === 'loading' ? 'Generating…' : state === 'copied' ? 'Copied!' : 'Export ↓'}
      </button>
      {state === 'error' && errorMsg && (
        <p className="absolute right-0 top-full mt-1 whitespace-nowrap rounded-sm bg-destructive/10 border border-destructive/20 px-2 py-1 text-[11px] text-destructive">
          {errorMsg}
        </p>
      )}
    </div>
  )
}
