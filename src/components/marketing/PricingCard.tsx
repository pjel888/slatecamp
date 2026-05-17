import Link from 'next/link'
import { CheckCircle, XCircle } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'
import type { PricingTier } from '@/lib/constants/pricing'

export const PricingCard = ({ tier }: { tier: PricingTier }) => {
  const isWideImpactCard = tier.id === 'corporate-partner'

  return (
  <div
    className={`flex h-full min-h-[430px] flex-col rounded-lg border p-5 transition-colors duration-150 ${
      tier.highlighted
        ? 'border-primary ring-1 ring-primary shadow-[0_0_0_1px_rgba(37,99,235,0.8)]'
        : 'border-border'
    } bg-white`}
  >
    <span className='text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground'>
      {tier.tierName}
    </span>
    <p className='mt-1 text-[18px] font-semibold leading-tight text-foreground'>
      {tier.subtitle}
    </p>
    <p className='mt-1.5 min-h-[36px] text-[12px] leading-snug text-foreground/70'>
      {tier.targetAudience}
    </p>

    <div className='mt-4'>
      <s
        className={`block min-h-[18px] text-[12px] text-muted-foreground ${
          tier.originalPrice ? '' : 'invisible'
        }`}
      >
        {tier.originalPrice ?? tier.price}
      </s>
      <span
        className={`font-semibold leading-none text-foreground ${
          tier.price.toLowerCase().includes('contact')
            ? 'text-[28px] tracking-[-0.02em]'
            : 'text-[36px]'
        }`}
      >
        {tier.price}
      </span>
      {tier.priceSubtext && (
        <span className='ml-1 text-[13px] text-muted-foreground'>
          {tier.priceSubtext}
        </span>
      )}
    </div>

    <p
      className='font-instrument-serif mt-3 min-h-[42px] text-[15px] italic leading-snug text-foreground/80'
    >
      &ldquo;{tier.hook}&rdquo;
    </p>

    <div className='my-3 h-px bg-border' />

    <ul
      className={`flex-1 ${
        isWideImpactCard
          ? 'grid gap-x-6 gap-y-1.5 md:grid-cols-2'
          : 'space-y-1.5'
      }`}
    >
      {tier.features.map((feature) => (
        <li
          key={feature}
          className='flex items-start gap-2 text-[12px] leading-snug text-foreground'
        >
          <SCIcon
            icon={CheckCircle}
            size='sm'
            className='mt-0.5 shrink-0 text-emerald'
          />
          {feature}
        </li>
      ))}
    </ul>

    {tier.limits && tier.limits.length > 0 && (
      <ul className='mt-4 space-y-2'>
        {tier.limits.map((limit) => (
          <li
            key={limit}
            className='flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground'
          >
            <SCIcon
              icon={XCircle}
              size='sm'
              className='mt-0.5 shrink-0 text-foreground/70'
            />
            {limit}
          </li>
        ))}
      </ul>
    )}

    <Button
      asChild
      fullWidth
      size='xl'
      className={`mt-4 h-auto py-2.5 text-[14px] ${
        tier.highlighted ? '' : 'bg-camp-cobalt hover:bg-primary-700'
      }`}
    >
      <Link href={tier.ctaHref}>{tier.ctaLabel}</Link>
    </Button>
  </div>
  )
}
