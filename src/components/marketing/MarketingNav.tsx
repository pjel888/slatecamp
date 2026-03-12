import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import {
  SLATECAMP_COBALT,
  SLATECAMP_INK,
  SLATECAMP_PAPER,
  hexToRgba,
} from '@/lib/constants'
import { SlateCampLogo } from '@/components/ui/SlateCampLogo'

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

  const linkStyle = (href: string) =>
    activeRoute === href
      ? { color: isDark ? '#fff' : SLATECAMP_INK.main }
      : { color: isDark ? 'rgba(255,255,255,0.5)' : SLATECAMP_INK.muted }

  const headerStyle = isDark
    ? {
        borderColor: 'rgba(255,255,255,0.06)',
        backgroundColor: hexToRgba(SLATECAMP_INK.main, 0.8),
      }
    : {
        borderColor: hexToRgba(SLATECAMP_INK.main, 0.06),
        backgroundColor: hexToRgba(SLATECAMP_PAPER.DEFAULT, 0.8),
      }

  return (
    <header
      className='fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl'
      style={headerStyle}
    >
      <div className='mx-auto flex h-14 max-w-[1200px] items-center justify-between'>
        {logoScrollsToTop ? (
          <a href='#top' className='inline-flex items-center'>
            <SlateCampLogo size='md' variant={isDark ? 'inverted' : 'default'} />
          </a>
        ) : (
          <Link href='/' className='inline-flex items-center'>
            <SlateCampLogo size='md' variant={isDark ? 'inverted' : 'default'} />
          </Link>
        )}

        <nav
          className='hidden items-center gap-1 text-[13px] sm:flex'
          style={{
            color: isDark ? 'rgba(255,255,255,0.5)' : SLATECAMP_INK.muted,
          }}
        >
          {activeRoute === '/' ? (
            <>
              <a
                href='#features'
                className='rounded-md px-3 py-3 transition-colors duration-150 hover:opacity-100'
                style={linkStyle('/')}
              >
                Features
              </a>
              <a
                href='#how-it-works'
                className='rounded-md px-3 py-3 transition-colors duration-150 hover:opacity-100'
                style={linkStyle('/')}
              >
                How it works
              </a>
            </>
          ) : (
            <>
              <Link
                href='/#features'
                className='rounded-md px-3 py-3 transition-colors duration-150 hover:opacity-100'
                style={linkStyle('/')}
              >
                Features
              </Link>
              <Link
                href='/#how-it-works'
                className='rounded-md px-3 py-3 transition-colors duration-150 hover:opacity-100'
                style={linkStyle('/')}
              >
                How it works
              </Link>
            </>
          )}
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className='rounded-md px-3 py-3 transition-colors duration-150'
              style={linkStyle(href)}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-2'>
          <Link
            href={ROUTES.LOGIN}
            className='hidden rounded-full px-4 py-3 text-[13px] transition-colors duration-150 sm:block hover:opacity-100'
            style={{
              color: isDark ? 'rgba(255,255,255,0.5)' : SLATECAMP_INK.muted,
            }}
          >
            Log in
          </Link>
          <Link
            href={ROUTES.REGISTER}
            className='rounded-full px-5 py-3 text-[13px] font-medium transition-opacity duration-150 hover:opacity-90'
            style={{ backgroundColor: SLATECAMP_INK.main, color: '#fff' }}
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
