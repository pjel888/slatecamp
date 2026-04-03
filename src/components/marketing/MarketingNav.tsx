import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { SlateCampLogo } from '@/components/ui/SlateCampLogo'
import { cn } from '@/lib/utils'
import { hasAuthCookie } from '@/lib/supabase/server'

const NAV_LINKS = [
  { href: ROUTES.TOOLS, label: 'Tools' },
  { href: ROUTES.PRICING, label: 'Pricing' },
  { href: ROUTES.ABOUT, label: 'About' },
  { href: ROUTES.CONTACT, label: 'Contact' },
] as const

export async function MarketingNav({
  activeRoute = '/',
  logoScrollsToTop = false,
  variant = 'light',
}: {
  activeRoute?: string
  logoScrollsToTop?: boolean
  variant?: 'light' | 'dark'
}) {
  const hasSession = await hasAuthCookie()
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
      : 'border-border-design bg-white/90 text-zinc-900',
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
                size='xl'
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
          {hasSession ? (
            <Link
              href={ROUTES.DASHBOARD}
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
                href={ROUTES.LOGIN}
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
                href={ROUTES.REGISTER}
                className={cn(
                  'rounded-sm px-5 py-3 text-[13px] font-medium text-white transition-colors duration-150',
                  isDark
                    ? 'bg-primary hover:bg-primary-700'
                    : 'bg-primary hover:bg-primary-700',
                )}
              >
                Join Free →
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
