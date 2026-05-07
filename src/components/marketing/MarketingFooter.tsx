import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import { siteConfig } from '@/lib/constants/site'

const FOOTER_LINKS = [
  { href: ROUTES.calculators.root, label: 'Tools' },
  { href: ROUTES.pricing, label: 'Pricing' },
  { href: ROUTES.about, label: 'About' },
  { href: ROUTES.contact, label: 'Contact' },
] as const

export const MarketingFooter = ({
  variant = 'light',
}: {
  variant?: 'light' | 'dark'
}) => {
  const isDark = variant === 'dark'
  const borderClass = isDark ? 'border-white/10' : 'border-border'
  const textMuted = isDark ? 'text-white/60' : 'text-muted-foreground'

  return (
    <footer className={`border-t ${borderClass}`}>
      <div className='mx-auto max-w-[1200px] px-6 py-7'>
        <div className='flex flex-col items-center justify-between gap-4 sm:flex-row'>
          <span className={`text-[12px] ${textMuted}`}>
            &copy; {new Date().getFullYear()} {siteConfig.name}
          </span>
          <nav className='flex items-center gap-1'>
            {FOOTER_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-sm px-3 py-3 text-[12px] transition-colors duration-150 hover:opacity-100 ${textMuted}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <span
            className={`font-instrument-serif text-[12px] italic tracking-wide ${textMuted}`}
          >
            Less panic, clearer study.
          </span>
        </div>
        <p className={`mx-auto mt-5 max-w-4xl text-center text-[11px] leading-relaxed ${textMuted}`}>
          SlateCamp is an educational study platform. It is not affiliated with PRC, PRBoA, universities, review centers, or government agencies. Always verify current code requirements, exam rules, and project decisions with primary authority documents or a qualified professional.
        </p>
      </div>
    </footer>
  )
}
