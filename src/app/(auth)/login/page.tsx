import Link from 'next/link'
import { LoginForm } from './login-form'
import { siteConfig } from '@/lib/constants/site'

export const metadata = { title: 'Log In' }

export default function LoginPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-color-bone px-6 py-12'>
      <div className='w-full max-w-[380px] space-y-8'>
        <div className='text-center'>
          <Link
            href='/'
            className='text-xl font-semibold tracking-tight text-color-charcoal transition-all duration-150 hover:opacity-80'
          >
            {siteConfig.name}
          </Link>
          <h1 className='mt-6 text-[22px] font-semibold leading-tight tracking-tight text-color-charcoal'>
            Log in
          </h1>
          <p className='mt-2 text-[14px] leading-relaxed text-color-graphite'>
            Welcome back. Sign in with Google to continue your review.
          </p>
        </div>

        <div className='rounded-sm border border-[#E8E4DF] bg-white p-6 shadow-[0_1px_3px_rgba(26,26,26,0.06)] transition-all duration-150'>
          <LoginForm />
        </div>

        <p className='text-center text-[13px] text-color-graphite'>
          Don&apos;t have an account?{' '}
          <Link
            href='/register'
            className='font-medium text-color-charcoal underline underline-offset-4 transition-all duration-150 hover:text-color-signal-amber'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
