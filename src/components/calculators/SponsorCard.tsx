// src/app/calculators/_components/SponsorCard.tsx
// Sponsor product card shown below inputs panel.
// Renders sponsor logo, name, and "Powered by" attribution.
// Hidden when no sponsor data is provided.
'use client'

interface SponsorCardProps {
  sponsorName: string
  logoUrl?: string
  /** Optional callback when user clicks sponsor link */
  onSponsorClick?: () => void
}

export function SponsorCard({
  sponsorName,
  logoUrl,
  onSponsorClick,
}: SponsorCardProps) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="font-mono text-[8px] uppercase tracking-widest text-muted-foreground">
        Powered by
      </p>
      <div className="mt-1.5 flex items-center gap-2">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={sponsorName}
            className="h-6 w-auto object-contain"
          />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded bg-muted">
            <span className="text-[8px] font-bold text-muted-foreground">
              {sponsorName.charAt(0)}
            </span>
          </div>
        )}
        <button
          onClick={onSponsorClick}
          className="font-sans text-xs font-medium text-foreground hover:text-primary"
        >
          {sponsorName}
        </button>
      </div>
    </div>
  )
}
