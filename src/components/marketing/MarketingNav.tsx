import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import { SlateCampLogo } from '@/components/graphics/logos/SlateCampLogo'
import { cn } from '@/lib/utils'
import { getUserIfPresent } from '@/lib/supabase/server'

const NAV_LINKS = [
  { href: ROUTES.pricing, label: 'Plans' },
] as const

export async function MarketingNav({
  activeRoute = '/',
  logoScrollsToTop = false,
  variant = 'light',
  isLoggedIn: knownIsLoggedIn,
}: {
  activeRoute?: string
  logoScrollsToTop?: boolean
  variant?: 'light' | 'dark'
  isLoggedIn?: boolean
}) {
  const authResult =
    typeof knownIsLoggedIn === 'boolean' ? null : await getUserIfPresent()
  const isLoggedIn =
    typeof knownIsLoggedIn === 'boolean'
      ? knownIsLoggedIn
      : !!authResult?.data.user
  const isDark = variant === 'dark'

  const linkClass = (href: string) =>
    cn(
      'rounded-sm px-3 py-3 transition-colors duration-150',
      activeRoute === href
        ? isDark
          ? 'text-white'
          : 'text-ink'
        : isDark
          ? 'text-white/60 hover:text-white'
          : 'text-text-2 hover:text-ink',
    )

  const headerClass = cn(
    'fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl px-6',
    isDark
      ? 'border-white/10 bg-primary/80 text-white'
      : 'border-border-design bg-white/90 text-foreground',
  )

  return (
    <header className={headerClass}>
      <div className='mx-auto flex h-14 max-w-[1200px] items-center justify-between'>
        <div className='flex items-center'>
          {logoScrollsToTop ? (
            <a href='#top' className='inline-flex items-center'>
              <SlateCampLogo
                size='lg'
                variant={isDark ? 'inverted' : 'landing'}
              />
            </a>
          ) : (
            <Link href='/' className='inline-flex items-center'>
              <SlateCampLogo
                size='lg'
                variant={isDark ? 'inverted' : 'landing'}
              />
            </Link>
          )}
        </div>

        <nav
          className={cn(
            'hidden items-center gap-1 text-[13px] sm:flex',
            isDark ? 'text-white/60' : 'text-text-2',
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
              <a href='#use-cases' className={linkClass('/')}>
                Use cases
              </a>
              <a href='#faq' className={linkClass('/')}>
                FAQ
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
              <Link href='/#use-cases' className={linkClass('/')}>
                Use cases
              </Link>
              <Link href='/#faq' className={linkClass('/')}>
                FAQ
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
          {isLoggedIn ? (
            <Link
              href={ROUTES.dashboard.root}
              className={cn(
                'rounded-sm px-5 py-3 text-[13px] font-medium text-white transition-colors duration-150',
                isDark
                  ? 'bg-primary hover:bg-primary-700'
                  : 'bg-primary hover:bg-primary-700',
              )}
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.auth.login}
                className={cn(
                  'rounded-sm px-4 py-3 text-[13px] transition-colors duration-150',
                  isDark
                    ? 'text-white/60 hover:text-white'
                    : 'text-text-2 hover:text-ink',
                )}
              >
                Log in
              </Link>
              <Link
                href={ROUTES.auth.register}
                className={cn(
                  'rounded-sm px-5 py-3 text-[13px] font-medium text-white transition-colors duration-150',
                  isDark
                    ? 'bg-primary hover:bg-primary-700'
                    : 'bg-primary hover:bg-primary-700',
                )}
              >
                Start Learning
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
