import Link from 'next/link'
import { LoginForm } from './login-form'
import { SlateCampLogo } from '@/components/graphics/logos/SlateCampLogo'

export const metadata = { title: 'Log In' }

export default function LoginPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12'>
      <div className='w-full max-w-[380px] space-y-8'>
        <div className='flex flex-col items-center text-center'>
          <Link
            href='/'
            className='transition-colors duration-150 hover:opacity-80'
          >
            <SlateCampLogo size="lg" />
          </Link>
          <h1 className='mt-6 text-xl font-semibold leading-tight text-zinc-900'>
            Log in
          </h1>
          <p className='mt-2 text-sm leading-relaxed text-zinc-500'>
            Welcome back. Sign in with Google to continue your review.
          </p>
        </div>

        <div className='rounded-md border border-zinc-200 bg-white p-6 shadow-sm'>
          <LoginForm />
        </div>

        <p className='text-center text-sm text-zinc-500'>
          Don&apos;t have an account?{' '}
          <Link
            href='/register'
            className='font-medium text-zinc-900 underline underline-offset-4 transition-colors duration-150 hover:text-primary'
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
