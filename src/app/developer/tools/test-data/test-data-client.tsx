'use client'

import { useState } from 'react'
import {
  generateTestSessions,
  generateTestOrg,
} from '@/lib/actions/dev/test-data'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type GenerateStatus = 'idle' | 'loading' | 'success' | 'error'

export function TestDataClient() {
  const [sessionStatus, setSessionStatus] = useState<GenerateStatus>('idle')
  const [orgStatus, setOrgStatus] = useState<GenerateStatus>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerateSessions() {
    setSessionStatus('loading')
    setMessage(null)
    setError(null)
    try {
      const result = await generateTestSessions(5)
      setSessionStatus('success')
      setMessage(result.message)
    } catch (err) {
      setSessionStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to generate test sessions')
    }
  }

  async function handleGenerateOrg() {
    setOrgStatus('loading')
    setMessage(null)
    setError(null)
    try {
      const result = await generateTestOrg()
      setOrgStatus('success')
      setMessage(result.message)
    } catch (err) {
      setOrgStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to generate test organization')
    }
  }

  return (
    <div className='space-y-6 max-w-2xl'>
      <div>
        <h1 className='text-lg font-bold text-foreground'>
          Test Data Generator
        </h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Generate mock data for testing different user scenarios.
        </p>
      </div>

      {message && (
        <div className='rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground'>
          {message}
        </div>
      )}

      {error && (
        <div className='rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='rounded-lg border border-border p-4'>
          <h3 className='text-sm font-semibold text-foreground'>
            Quiz Sessions
          </h3>
          <p className='mt-1 text-xs text-muted-foreground'>
            Generate 5 mock quiz sessions with randomized responses.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type='button'
                size='sm'
                className='mt-3'
                disabled={sessionStatus === 'loading'}
              >
                {sessionStatus === 'loading'
                  ? 'Generating...'
                  : 'Generate Sessions'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Generate Test Sessions</AlertDialogTitle>
                <AlertDialogDescription>
                  This will create 5 mock quiz sessions in the database. Continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleGenerateSessions}>
                  Generate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className='rounded-lg border border-border p-4'>
          <h3 className='text-sm font-semibold text-foreground'>
            Organization
          </h3>
          <p className='mt-1 text-xs text-muted-foreground'>
            Generate a test organization with sample members.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type='button'
                size='sm'
                className='mt-3'
                disabled={orgStatus === 'loading'}
              >
                {orgStatus === 'loading' ? 'Generating...' : 'Generate Org'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Generate Test Organization</AlertDialogTitle>
                <AlertDialogDescription>
                  This will create a test organization and assign you as owner. Continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleGenerateOrg}>
                  Generate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
