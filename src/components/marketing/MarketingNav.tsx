import Link from 'next/link'
import { getUser } from '@/lib/supabase/server'
import { ROUTES } from '@/lib/constants/routes'
import { siteConfig } from '@/lib/constants/site'

const NAV_LINKS = [
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
  const isDark = variant === 'dark'
  let isLoggedIn = false
  try {
    const {
      data: { user },
    } = await getUser()
    isLoggedIn = !!user
  } catch {
    isLoggedIn = false
  }

  const linkClass = (href: string) =>
    `transition-colors duration-150 ${
      activeRoute === href
        ? isDark
          ? 'text-white'
          : 'text-[#1D1D1F]'
        : isDark
          ? 'text-white/50 hover:text-white'
          : 'text-[#6E6E73] hover:text-[#1D1D1F]'
    }`

  const navLinkHover = isDark
    ? 'rounded-md px-3 py-3 transition-colors duration-150 text-white/50 hover:text-white'
    : 'rounded-md px-3 py-3 transition-colors duration-150 hover:text-[#1D1D1F]'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl ${
        isDark
          ? 'border-white/[0.06] bg-[#0F172A]/80'
          : 'border-charcoal/6 bg-[#F5F4F0]/80'
      }`}
    >
      <div className='mx-auto flex h-14 max-w-[1200px] items-center justify-between '>
        {logoScrollsToTop ? (
          <a
            href='#top'
            className={`text-[15px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-charcoal'}`}
          >
            {siteConfig.name}
          </a>
        ) : (
          <Link
            href='/'
            className={`text-[15px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-charcoal'}`}
          >
            {siteConfig.name}
          </Link>
        )}

        <nav
          className={`hidden items-center gap-1 text-[13px] sm:flex ${isDark ? 'text-white/50' : 'text-graphite'}`}
        >
          {activeRoute === '/' ? (
            <>
              <a href='#features' className={navLinkHover}>
                Features
              </a>
              <a href='#how-it-works' className={navLinkHover}>
                How it works
              </a>
            </>
          ) : (
            <>
              <Link href='/#features' className={navLinkHover}>
                Features
              </Link>
              <Link href='/#how-it-works' className={navLinkHover}>
                How it works
              </Link>
            </>
          )}
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-md px-3 py-3 ${linkClass(href)}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-2'>
          {isLoggedIn ? (
            <Link
              href={ROUTES.DASHBOARD}
              className={`rounded-full px-5 py-3 text-[13px] font-medium transition-opacity duration-150 hover:opacity-90 ${
                isDark ? 'bg-white text-[#0F172A]' : 'bg-charcoal text-white'
              }`}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.LOGIN}
                className={`hidden rounded-full px-4 py-3 text-[13px] transition-colors duration-150 sm:block ${
                  isDark
                    ? 'text-white/50 hover:text-white'
                    : 'text-graphite hover:text-charcoal'
                }`}
              >
                Log in
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className={`rounded-full px-5 py-3 text-[13px] font-medium transition-opacity duration-150 hover:opacity-90 ${
                  isDark ? 'bg-[#1f3055] text-white' : 'bg-charcoal text-white'
                }`}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
