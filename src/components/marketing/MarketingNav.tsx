import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { SlateCampLogo } from '@/components/ui/SlateCampLogo'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: ROUTES.PRICING, label: 'Pricing' },
  { href: ROUTES.ABOUT, label: 'About' },
  { href: ROUTES.CONTACT, label: 'Contact' },
] as const

export const MarketingNav = ({
  activeRoute = '/',
  logoScrollsToTop = false,
  variant = 'light',
}: {
  activeRoute?: string
  logoScrollsToTop?: boolean
  variant?: 'light' | 'dark'
}) => {
  const isDark = variant === 'dark'

  const linkClass = (href: string) =>
    cn(
      'rounded-md px-3 py-3 transition-colors duration-150',
      activeRoute === href
        ? isDark
          ? 'text-white'
          : 'text-zinc-900'
        : isDark
          ? 'text-white/60 hover:text-white'
          : 'text-zinc-500 hover:text-zinc-800',
    )

  const headerClass = cn(
    'fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl px-6',
    isDark
      ? 'border-white/10 bg-zinc-900/80 text-white'
      : 'border-zinc-200 bg-white/80 text-zinc-900',
  )

  return (
    <header className={headerClass}>
      <div className='mx-auto flex h-14 max-w-[1200px] items-center justify-between'>
        {logoScrollsToTop ? (
          <a href='#top' className='inline-flex items-center'>
            <SlateCampLogo
              size='md'
              variant={isDark ? 'inverted' : 'default'}
            />
          </a>
        ) : (
          <Link href='/' className='inline-flex items-center'>
            <SlateCampLogo
              size='md'
              variant={isDark ? 'inverted' : 'default'}
            />
          </Link>
        )}

        <nav
          className={cn(
            'hidden items-center gap-1 text-[13px] sm:flex',
            isDark ? 'text-white/60' : 'text-zinc-500',
          )}
        >
          {activeRoute === '/' ? (
            <>
              <a href='#features' className={linkClass('/')}>
                Features
              </a>
              <a href='#how-it-works' className={linkClass('/')}>
                How it works
              </a>
            </>
          ) : (
            <>
              <Link href='/#features' className={linkClass('/')}>
                Features
              </Link>
              <Link href='/#how-it-works' className={linkClass('/')}>
                How it works
              </Link>
            </>
          )}
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              {label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-2'>
          <Link
            href={ROUTES.LOGIN}
            className={cn(
              'hidden rounded-full px-4 py-3 text-[13px] transition-colors duration-150 sm:block',
              isDark
                ? 'text-white/60 hover:text-white'
                : 'text-zinc-500 hover:text-zinc-800',
            )}
          >
            Log in
          </Link>
          <Link
            href={ROUTES.REGISTER}
            className={cn(
              'rounded-full px-5 py-3 text-[13px] font-medium text-white transition-colors duration-150',
              isDark
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-blue-600 hover:bg-blue-700',
            )}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
