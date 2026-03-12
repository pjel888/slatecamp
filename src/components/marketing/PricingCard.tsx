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

export function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={`flex flex-col rounded-2xl border bg-white p-7 transition-transform duration-150 hover:-translate-y-0.5 ${
        tier.highlighted
          ? 'border-[#1f3055] ring-1 ring-[#1f3055]'
          : 'border-[#1D1D1F]/[0.06]'
      }`}
    >
      {/* Tier name & subtitle */}
      <span className='text-[11px] font-medium uppercase tracking-[0.15em] text-[#86868B]'>
        {tier.tierName}
      </span>
      <p className='mt-1 text-[13px] text-[#6E6E73]'>{tier.targetAudience}</p>

      {/* Price */}
      <div className='mt-5'>
        {tier.originalPrice && (
          <s className='block text-[13px] text-[#AEAEB2]'>
            {tier.originalPrice}
          </s>
        )}
        <span className='text-[40px] font-semibold leading-none tracking-tight text-[#1D1D1F]'>
          {tier.price}
        </span>
        {tier.priceSubtext && (
          <span className='ml-1 text-[13px] text-[#AEAEB2]'>
            {tier.priceSubtext}
          </span>
        )}
      </div>

      {/* Hook */}
      <p
        className={`${serif.className} mt-4 text-[17px] italic leading-snug text-[#1D1D1F]/70`}
      >
        &ldquo;{tier.hook}&rdquo;
      </p>

      {/* Divider */}
      <div className='my-5 h-px bg-[#1D1D1F]/[0.06]' />

      {/* Features */}
      <ul className='flex-1 space-y-2.5'>
        {tier.features.map((feature) => (
          <li
            key={feature}
            className='flex items-start gap-2.5 text-[13px] leading-relaxed text-[#1D1D1F]'
          >
            <Check
              className='mt-0.5 h-4 w-4 shrink-0 text-[#4A7C59]'
              strokeWidth={1.5}
            />
            {feature}
          </li>
        ))}
      </ul>

      {/* Limits */}
      {tier.limits && tier.limits.length > 0 && (
        <ul className='mt-4 space-y-2'>
          {tier.limits.map((limit) => (
            <li
              key={limit}
              className='flex items-start gap-2.5 text-[13px] leading-relaxed text-[#86868B]'
            >
              <X
                className='mt-0.5 h-4 w-4 shrink-0 text-[#BF1B1B]/60'
                strokeWidth={1.5}
              />
              {limit}
            </li>
          ))}
        </ul>
      )}

      {/* CTA */}
      <Link
        href={tier.ctaHref}
        className={`mt-7 block w-full rounded-full px-7 py-3 text-center text-[15px] font-medium text-white transition-all duration-150 ${
          tier.highlighted
            ? 'bg-[#1f3055] hover:brightness-110'
            : 'bg-[#1D1D1F] hover:opacity-90'
        }`}
      >
        {tier.ctaLabel}
      </Link>
    </div>
  )
}
