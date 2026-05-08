import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { ROUTES } from '@/lib/routes'
import { SlateCampLogo } from '@/components/graphics/logos/SlateCampLogo'
import { cn } from '@/lib/utils'
import { getUserIfPresent } from '@/lib/supabase/server'

const SECONDARY_NAV_LINKS = [
  { href: '#features', routeHref: '/#features', label: 'Features' },
  { href: '#how-it-works', routeHref: '/#how-it-works', label: 'How it works' },
  { href: ROUTES.calculators.root, routeHref: ROUTES.calculators.root, label: 'Tools' },
  { href: ROUTES.pricing, routeHref: ROUTES.pricing, label: 'Pricing' },
  { href: ROUTES.about, routeHref: ROUTES.about, label: 'About' },
  { href: ROUTES.contact, routeHref: ROUTES.contact, label: 'Contact' },
] as const

export async function MarketingNav({
  activeRoute = '/',
  logoScrollsToTop = false,
  variant = 'light',
  isLoggedIn: isLoggedInOverride,
  showSecondaryNav = true,
  fixed = true,
}: {
  activeRoute?: string
  logoScrollsToTop?: boolean
  variant?: 'light' | 'dark'
  isLoggedIn?: boolean
  showSecondaryNav?: boolean
  fixed?: boolean
}) {
  const isLoggedIn = isLoggedInOverride ?? !!(await getUserIfPresent()).data.user
  const isDark = variant === 'dark'

  const secondaryLinkClass = (href: string) =>
    cn(
      'inline-flex h-10 items-center rounded-sm px-4 text-[13px] font-medium transition-colors duration-150',
      activeRoute === href
        ? isDark
          ? 'bg-white/[0.08] text-white'
          : 'bg-white/[0.18] text-ink shadow-xs'
        : isDark
          ? 'text-white/70 hover:bg-white/[0.08] hover:text-white'
          : 'text-ink/75 hover:bg-white/[0.16] hover:text-ink',
    )

  const headerClass = cn(
    'z-50 text-foreground',
    fixed ? 'fixed inset-x-0 top-0' : 'relative',
  )

  const primaryNavClass = cn(
    'border-b px-6 backdrop-blur-xl',
    isDark
      ? 'border-white/10 bg-primary/90 text-white'
      : 'border-border-design bg-white text-foreground',
  )

  const secondaryNavClass = cn(
    'relative hidden px-6 backdrop-blur-2xl supports-[backdrop-filter]:backdrop-blur-2xl md:block [mask-image:linear-gradient(to_bottom,black_0%,black_58%,rgba(0,0,0,0.72)_76%,transparent_100%)]',
    isDark
      ? 'bg-primary/[0.16] text-white shadow-[0_18px_60px_rgba(0,0,0,0.20)]'
      : 'bg-white/[0.07] text-foreground shadow-[0_18px_60px_rgba(15,23,42,0.06)]',
  )

  return (
    <header className={headerClass}>
      <div className={primaryNavClass}>
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

          <div className='flex items-center gap-2'>
            {isLoggedIn ? (
              <Link
                href={ROUTES.dashboard.root}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-sm px-4 py-3 text-[13px] font-medium transition-colors duration-150',
                  isDark
                    ? 'text-camp-gold hover:bg-white/10 hover:text-camp-gold'
                    : 'text-primary hover:bg-primary/5 hover:text-primary',
                )}
              >
                Dashboard
                <ArrowRight className='size-3.5' aria-hidden='true' strokeWidth={2} />
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
                  Join Free →
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {showSecondaryNav ? (
        <nav className={secondaryNavClass} aria-label='Primary landing navigation'>
          <div className='mx-auto flex h-20 max-w-[1200px] items-center justify-center overflow-hidden'>
            <div
              className={cn(
                'flex min-w-max items-center gap-1 rounded-sm border px-2 py-2 text-[13px] backdrop-blur-xl',
                isDark
                  ? 'border-white/10 bg-white/[0.04] text-white/70'
                  : 'border-white/25 bg-white/[0.08] text-ink/75',
              )}
            >
              {SECONDARY_NAV_LINKS.map(({ href, routeHref, label }) => {
                const linkHref = activeRoute === '/' ? href : routeHref

                return linkHref.startsWith('#') ? (
                  <a key={label} href={linkHref} className={secondaryLinkClass(href)}>
                    {label}
                  </a>
                ) : (
                  <Link key={label} href={linkHref} className={secondaryLinkClass(href)}>
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
