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
}: {
  activeRoute?: string
  logoScrollsToTop?: boolean
}) {
  let isLoggedIn = false
  try {
    const { data: { user } } = await getUser()
    isLoggedIn = !!user
  } catch {
    isLoggedIn = false
  }

  const linkClass = (href: string) =>
    `transition-colors duration-150 ${
      activeRoute === href
        ? 'text-[#1D1D1F]'
        : 'text-[#6E6E73] hover:text-[#1D1D1F]'
    }`

  return (
    <header className='fixed inset-x-0 top-0 z-50 border-b border-charcoal/6 bg-[#F5F4F0]/80 backdrop-blur-xl'>
      <div className='mx-auto flex h-14 max-w-[1200px] items-center justify-between px-6'>
        {logoScrollsToTop ? (
          <a
            href='#top'
            className='text-[15px] font-semibold tracking-tight text-charcoal'
          >
            {siteConfig.name}
          </a>
        ) : (
          <Link
            href='/'
            className='text-[15px] font-semibold tracking-tight text-charcoal'
          >
            {siteConfig.name}
          </Link>
        )}

        <nav className='hidden items-center gap-1 text-[13px] text-graphite sm:flex'>
          {activeRoute === '/' ? (
            <>
              <a
                href='#features'
                className='rounded-md px-3 py-3 transition-colors duration-150 hover:text-[#1D1D1F]'
              >
                Features
              </a>
              <a
                href='#how-it-works'
                className='rounded-md px-3 py-3 transition-colors duration-150 hover:text-[#1D1D1F]'
              >
                How it works
              </a>
            </>
          ) : (
            <>
              <Link
                href='/#features'
                className='rounded-md px-3 py-3 transition-colors duration-150 hover:text-[#1D1D1F]'
              >
                Features
              </Link>
              <Link
                href='/#how-it-works'
                className='rounded-md px-3 py-3 transition-colors duration-150 hover:text-[#1D1D1F]'
              >
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
              className='rounded-full bg-charcoal px-5 py-3 text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-90'
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href={ROUTES.LOGIN}
                className='hidden rounded-full px-4 py-3 text-[13px] text-graphite transition-colors duration-150 hover:text-charcoal sm:block'
              >
                Log in
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className='rounded-full bg-charcoal px-5 py-3 text-[13px] font-medium text-white transition-opacity duration-150 hover:opacity-90'
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
