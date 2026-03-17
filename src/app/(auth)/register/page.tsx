import Link from 'next/link'
import { RegisterForm } from './register-form'
import { siteConfig } from '@/lib/constants/site'

export const metadata = { title: 'Create Account' }

export default function RegisterPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 py-12'>
      <div className='w-full max-w-[380px] space-y-8'>
        <div className='text-center'>
          <Link
            href='/'
            className='text-lg font-semibold tracking-tight text-zinc-900 transition-colors duration-150 hover:opacity-80'
          >
            {siteConfig.name}
          </Link>
          <h1 className='mt-6 text-xl font-semibold leading-tight tracking-tight text-zinc-900'>
            Create your account
          </h1>
          <p className='mt-2 text-sm leading-relaxed text-zinc-500'>
            Sign in with Google to get started. One account. Everything
            verified.
          </p>
        </div>

        <div className='rounded-md border border-zinc-200 bg-white p-6 shadow-sm'>
          <RegisterForm />
        </div>

        <p className='text-center text-sm text-zinc-500'>
          Already have an account?{' '}
          <Link
            href='/login'
            className='font-medium text-zinc-900 underline underline-offset-4 transition-colors duration-150 hover:text-blue-600'
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
