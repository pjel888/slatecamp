import Link from 'next/link'
import { RegisterForm } from './register-form'
import { siteConfig } from '@/lib/constants/site'
import { ROUTES } from '@/lib/routes'

export const metadata = { title: 'Create Account' }

export default function RegisterPage() {
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
            Continue to see your score
          </h1>
          <p className='mt-2 text-sm leading-relaxed text-muted-foreground'>
            Create a free account to save your Readiness Score and start
            your study trail.
          </p>
        </div>

        <div className='rounded-md border border-border bg-card p-6 shadow-sm'>
          <RegisterForm />
        </div>

        <p className='text-center text-sm text-muted-foreground'>
          Already have an account?{' '}
          <Link
            href={ROUTES.auth.login}
            className='font-medium text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-primary'
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
