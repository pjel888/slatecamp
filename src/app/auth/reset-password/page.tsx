'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle, Warning } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { siteConfig } from '@/lib/constants/site'
import { ROUTES } from '@/lib/routes'
import { createClient } from '@/lib/supabase/client'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [updated, setUpdated] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setUpdated(true)
    setLoading(false)
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12'>
      <div className='w-full max-w-[380px] space-y-8'>
        <div className='text-center'>
          <Link
            href={ROUTES.home}
            className='text-lg font-semibold text-foreground transition-colors duration-150 hover:opacity-80'
          >
            {siteConfig.name}
          </Link>
          <h1 className='mt-6 text-xl font-semibold leading-tight text-foreground'>
            Set a new password
          </h1>
          <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
            {updated
              ? 'Your password has been updated.'
              : 'Enter a new password for your SlateCamp account.'}
          </p>
        </div>

        <div className='rounded-md border border-border bg-card p-6 shadow-sm'>
          {updated ? (
            <div className='space-y-4 text-center'>
              <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-md bg-success/10 text-success'>
                <SCIcon icon={CheckCircle} size='base' />
              </div>
              <Button
                type='button'
                className='w-full'
                onClick={() => router.push(ROUTES.dashboard.root)}
              >
                Continue to dashboard
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='password'>New password</Label>
                <Input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete='new-password'
                  required
                  className='focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='confirm-password'>Confirm password</Label>
                <Input
                  id='confirm-password'
                  type='password'
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  minLength={MIN_PASSWORD_LENGTH}
                  autoComplete='new-password'
                  required
                  className='focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2'
                />
              </div>

              {error && (
                <div className='flex items-start gap-2 text-sm text-destructive' role='alert'>
                  <SCIcon icon={Warning} size='sm' className='mt-0.5 shrink-0' />
                  <span>{error}</span>
                </div>
              )}

              <Button type='submit' className='w-full' disabled={loading}>
                {loading ? 'Updating...' : 'Update password'}
              </Button>
            </form>
          )}
        </div>

        <p className='text-center text-sm text-muted-foreground'>
          <Link
            href={ROUTES.auth.login}
            className='font-medium text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-primary'
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
