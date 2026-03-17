'use client'

import { useState } from 'react'
import { generateTestSessions, generateTestOrg } from '@/lib/actions/dev/test-data'

type GenerateStatus = 'idle' | 'loading' | 'success' | 'error'

export function TestDataClient() {
  const [sessionStatus, setSessionStatus] = useState<GenerateStatus>('idle')
  const [orgStatus, setOrgStatus] = useState<GenerateStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function handleGenerateSessions() {
    setSessionStatus('loading')
    setMessage(null)
    try {
      const result = await generateTestSessions(5)
      setSessionStatus('success')
      setMessage(result.message)
    } catch {
      setSessionStatus('error')
      setMessage('Failed to generate test sessions')
    }
  }

  async function handleGenerateOrg() {
    setOrgStatus('loading')
    setMessage(null)
    try {
      const result = await generateTestOrg()
      setOrgStatus('success')
      setMessage(result.message)
    } catch {
      setOrgStatus('error')
      setMessage('Failed to generate test organization')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-lg font-bold text-foreground">Test Data Generator</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate mock data for testing different user scenarios.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Quiz Sessions</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Generate 5 mock quiz sessions with randomized responses.
          </p>
          <button
            type="button"
            onClick={handleGenerateSessions}
            disabled={sessionStatus === 'loading'}
            className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2F5A85] disabled:opacity-50"
          >
            {sessionStatus === 'loading' ? 'Generating...' : 'Generate Sessions'}
          </button>
        </div>

        <div className="rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold text-foreground">Organization</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Generate a test organization with sample members.
          </p>
          <button
            type="button"
            onClick={handleGenerateOrg}
            disabled={orgStatus === 'loading'}
            className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#2F5A85] disabled:opacity-50"
          >
            {orgStatus === 'loading' ? 'Generating...' : 'Generate Org'}
          </button>
        </div>
      </div>
    </div>
  )
}
