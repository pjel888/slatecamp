import Link from 'next/link'
import { Instrument_Serif } from 'next/font/google'
import { Check, X } from 'lucide-react'
import type { PricingTier } from '@/lib/constants/pricing'

const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
})

export const PricingCard = ({ tier }: { tier: PricingTier }) => (
  <div
    className={`flex flex-col rounded-2xl border p-7 transition-transform duration-150 hover:-translate-y-0.5 ${
      tier.highlighted
        ? 'border-blue-600 ring-1 ring-blue-600 shadow-[0_0_0_1px_rgba(37,99,235,0.8)]'
        : 'border-zinc-200'
    } bg-white`}
  >
    <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">
      {tier.tierName}
    </span>
    <p className="mt-1 text-[13px] text-zinc-600">{tier.targetAudience}</p>

    <div className="mt-5">
      {tier.originalPrice && (
        <s className="block text-[13px] text-zinc-400">{tier.originalPrice}</s>
      )}
      <span className="text-[40px] font-semibold leading-none tracking-tight text-zinc-900">
        {tier.price}
      </span>
      {tier.priceSubtext && (
        <span className="ml-1 text-[13px] text-zinc-400">
          {tier.priceSubtext}
        </span>
      )}
    </div>

    <p
      className={`${serif.className} mt-4 text-[17px] italic leading-snug text-zinc-700`}
    >
      &ldquo;{tier.hook}&rdquo;
    </p>

    <div className="my-5 h-px bg-zinc-200" />

    <ul className="flex-1 space-y-2.5">
      {tier.features.map((feature) => (
        <li
          key={feature}
          className="flex items-start gap-2.5 text-[13px] leading-relaxed text-zinc-900"
        >
          <Check
            className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
            strokeWidth={1.5}
          />
          {feature}
        </li>
      ))}
    </ul>

    {tier.limits && tier.limits.length > 0 && (
      <ul className="mt-4 space-y-2">
        {tier.limits.map((limit) => (
          <li
            key={limit}
            className="flex items-start gap-2.5 text-[13px] leading-relaxed text-zinc-500"
          >
            <X
              className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600"
              strokeWidth={1.5}
            />
            {limit}
          </li>
        ))}
      </ul>
    )}

    <Link
      href={tier.ctaHref}
      className={`mt-7 block w-full rounded-full px-7 py-3 text-center text-[15px] font-medium text-white transition-all duration-150 ${
        tier.highlighted
          ? 'bg-blue-600 hover:bg-blue-700'
          : 'bg-zinc-900 hover:bg-zinc-800'
      }`}
    >
      {tier.ctaLabel}
    </Link>
  </div>
)
