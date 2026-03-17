import Link from 'next/link'
import type { AdSlot } from '@/lib/constants/ads'

interface SponsoredCardProps {
  ad: AdSlot
  /**
   * subject — same footprint as a subject card in the hub grid
   * category — same footprint as a category card in the subject landing grid
   * rail — narrow vertical card for the article right rail
   */
  variant: 'subject' | 'category' | 'rail'
}

export function SponsoredCard({ ad, variant }: SponsoredCardProps) {
  const isRail = variant === 'rail'

  return (
    <div
      className={`rounded-sm border border-border/40 bg-secondary/20 flex flex-col ${
        isRail ? 'p-3' : 'p-4'
      }`}
    >
      <span className='text-[11px] text-muted-foreground/60 uppercase tracking-wide mb-2'>
        {ad.label}
      </span>

      <p
        className={`font-medium text-foreground leading-snug mb-1 ${isRail ? 'text-xs' : 'text-sm'}`}
      >
        {ad.headline}
      </p>

      <p
        className={`text-muted-foreground flex-1 mb-3 ${isRail ? 'text-[11px]' : 'text-xs'}`}
      >
        {ad.body}
      </p>

      <Link
        href={ad.ctaUrl}
        target='_blank'
        rel='noopener noreferrer sponsored'
        className={`inline-flex items-center justify-center rounded-sm border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground ${
          isRail ? 'text-[11px] px-2 py-1' : 'text-xs px-3 py-1.5'
        }`}
      >
        {ad.ctaText}
      </Link>
    </div>
  )
}
