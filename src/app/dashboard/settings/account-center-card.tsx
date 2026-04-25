import Link from 'next/link'
import { ShieldCheck, CreditCard, Lifebuoy } from '@phosphor-icons/react/dist/ssr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FEATURE_PAYMENTS_ENABLED } from '@/lib/constants/feature-flags'
import { ROUTES } from '@/lib/routes'
import type { UserTier } from '@/types/app'

interface AccountCenterCardProps {
  effectiveTier: UserTier
}

const accountSections = [
  {
    icon: ShieldCheck,
    title: 'Security',
    body: 'Password changes are handled through the secure reset flow. Use it if your email access or password is at risk.',
    href: ROUTES.auth.forgotPassword,
    cta: 'Reset password',
  },
  {
    icon: Lifebuoy,
    title: 'Privacy and support',
    body: 'For data export, deletion, billing questions, or account recovery, contact support from the public support route.',
    href: ROUTES.contact,
    cta: 'Contact support',
  },
] as const

export const AccountCenterCard = ({ effectiveTier }: AccountCenterCardProps) => {
  const billingStatus = FEATURE_PAYMENTS_ENABLED
    ? 'Billing is enabled. Confirm checkout and webhook validation before taking live payments.'
    : 'Payments are disabled. No payment method is collected and checkout is blocked until billing is launch-ready.'

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardHeader className="border-b border-border bg-muted/50">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-primary/10 p-2">
            <CreditCard size={20} className="text-primary" aria-hidden />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Account Center</CardTitle>
            <p className="text-xs text-muted-foreground">
              Review access, billing status, security, privacy, and support.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="rounded-md border border-border bg-card px-4 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Current access</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tier: <span className="font-semibold uppercase text-foreground">{effectiveTier}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{billingStatus}</p>
            </div>
            <span className="inline-flex w-fit items-center rounded-sm border border-border px-2.5 py-1 text-[11px] font-semibold uppercase text-muted-foreground">
              {FEATURE_PAYMENTS_ENABLED ? 'Billing on' : 'Billing off'}
            </span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {accountSections.map((section) => (
            <div key={section.title} className="rounded-md border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-sm bg-muted p-2">
                  <section.icon
                    size={18}
                    className="text-muted-foreground"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{section.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.body}</p>
                  <Link
                    href={section.href}
                    className="mt-3 inline-flex text-xs font-semibold text-primary transition-colors hover:text-primary-700"
                  >
                    {section.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
