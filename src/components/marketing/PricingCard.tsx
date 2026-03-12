import Link from 'next/link'
import { Instrument_Serif } from 'next/font/google'
import { Check, X } from 'lucide-react'
import type { PricingTier } from '@/lib/constants/pricing'
import { SLATECAMP_INK, SLATECAMP_PAPER, SLATECAMP_AMBER, SLATECAMP_BORDER, SLATECAMP_SAGE, hexToRgba } from '@/lib/constants'

const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const PricingCard = ({ tier }: { tier: PricingTier }) => (
  <div
    className={`flex flex-col rounded-2xl border p-7 transition-transform duration-150 hover:-translate-y-0.5 ${tier.highlighted ? 'ring-1' : ''}`}
    style={{
      backgroundColor: SLATECAMP_PAPER.snow,
      borderColor: tier.highlighted ? SLATECAMP_AMBER.DEFAULT : SLATECAMP_BORDER.DEFAULT,
      ...(tier.highlighted ? { boxShadow: `0 0 0 1px ${SLATECAMP_AMBER.DEFAULT}` } : {}),
    }}
  >
    <span className="text-[11px] font-medium uppercase tracking-[0.15em]" style={{ color: SLATECAMP_INK.subtle }}>{tier.tierName}</span>
    <p className="mt-1 text-[13px]" style={{ color: SLATECAMP_INK.muted }}>{tier.targetAudience}</p>

    <div className="mt-5">
      {tier.originalPrice && (
        <s className="block text-[13px]" style={{ color: SLATECAMP_INK.faint }}>{tier.originalPrice}</s>
      )}
      <span className="text-[40px] font-semibold leading-none tracking-tight" style={{ color: SLATECAMP_INK.main }}>{tier.price}</span>
      {tier.priceSubtext && (
        <span className="ml-1 text-[13px]" style={{ color: SLATECAMP_INK.faint }}>{tier.priceSubtext}</span>
      )}
    </div>

    <p className={`${serif.className} mt-4 text-[17px] italic leading-snug`} style={{ color: hexToRgba(SLATECAMP_INK.main, 0.7) }}>
      &ldquo;{tier.hook}&rdquo;
    </p>

    <div className="my-5 h-px" style={{ backgroundColor: SLATECAMP_BORDER.DEFAULT }} />

    <ul className="flex-1 space-y-2.5">
      {tier.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2.5 text-[13px] leading-relaxed" style={{ color: SLATECAMP_INK.main }}>
          <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: SLATECAMP_SAGE.DEFAULT }} strokeWidth={1.5} />
          {feature}
        </li>
      ))}
    </ul>

    {tier.limits && tier.limits.length > 0 && (
      <ul className="mt-4 space-y-2">
        {tier.limits.map((limit) => (
          <li key={limit} className="flex items-start gap-2.5 text-[13px] leading-relaxed" style={{ color: SLATECAMP_INK.subtle }}>
            <X className="mt-0.5 h-4 w-4 shrink-0" style={{ color: SLATECAMP_INK.muted }} strokeWidth={1.5} />
            {limit}
          </li>
        ))}
      </ul>
    )}

    <Link
      href={tier.ctaHref}
      className={`mt-7 block w-full rounded-full px-7 py-3 text-center text-[15px] font-medium transition-all duration-150 ${tier.highlighted ? 'hover:brightness-110' : 'hover:opacity-90'}`}
      style={{ backgroundColor: tier.highlighted ? SLATECAMP_AMBER.DEFAULT : SLATECAMP_INK.main, color: SLATECAMP_PAPER.snow }}
    >
      {tier.ctaLabel}
    </Link>
  </div>
)
