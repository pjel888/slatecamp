import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionHeader } from '@/components/shared/section-header'
import { EndpointCard } from '@/components/developer/EndpointCard'
import { actionGroups, payrexWebhookEvents, routeHandlerSections, sharedWebhookConventions, webhookSignatureNotes } from '@/lib/developer/api-reference-data'

export const metadata = {
  title: 'API Reference — SlateCamp Developer Portal',
  description:
    'Complete API documentation for SlateCamp route handlers, server actions, and webhooks.',
}
// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ApiReferencePage() {
  return (
    <div className="max-w-5xl space-y-6">
      <SectionHeader
        eyebrow="Documentation"
        title="API Reference"
        subtitle="Route handlers, server actions, and webhook contracts for the SlateCamp platform. Expand any endpoint to view request schemas, response shapes, and curl examples."
        level="page"
        className="max-w-xl"
      />

      {/* Tabs */}
      <Tabs defaultValue="routes">
        <TabsList variant="underline" className="w-full justify-start">
          <TabsTrigger value="routes" className="text-[13px]">
            Route Handlers
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-[13px]">
            Server Actions
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="text-[13px]">
            Webhooks
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Route Handlers ─────────────────────────────── */}
        <TabsContent value="routes" className="pt-6 space-y-8">
          {routeHandlerSections.map((section) => (
            <section key={section.label}>
              <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
                {section.label}
              </p>
              <div className="space-y-2">
                {section.endpoints.map((ep) => (
                  <EndpointCard key={`${ep.method}-${ep.path}`} {...ep} />
                ))}
              </div>
            </section>
          ))}
        </TabsContent>

        {/* ── Tab 2: Server Actions ─────────────────────────────── */}
        <TabsContent value="actions" className="pt-6 space-y-8">
          <p className="text-[12px] text-muted-foreground -mt-2">
            All functions are annotated{' '}
            <span className="font-[family-name:var(--font-dm-mono)] text-foreground">
              {'\'use server\''}
            </span>{' '}
            and called directly from Server or Client components. Auth is enforced inside each
            action via Supabase{' '}
            <span className="font-[family-name:var(--font-dm-mono)] text-foreground">getUser()</span>.
          </p>

          {actionGroups.map((group) => (
            <section key={group.domain}>
              <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
                {group.domain}
              </p>
              <div className="rounded-xs border border-border overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border bg-muted/60">
                      <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[30%]">
                        Function
                      </th>
                      <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[30%]">
                        Description
                      </th>
                      <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[20%] hidden lg:table-cell">
                        Tables
                      </th>
                      <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[10%]">
                        Auth
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.actions.map((action, i) => (
                      <tr
                        key={action.fn}
                        className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors duration-150 ${i % 2 === 0 ? '' : 'bg-muted/20'}`}
                      >
                        <td className="px-4 py-2.5 align-top">
                          <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-foreground">
                            {action.fn}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <span className="text-[11px] text-muted-foreground leading-relaxed">
                            {action.description}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 align-top hidden lg:table-cell">
                          <span className="text-[11px] text-muted-foreground font-[family-name:var(--font-dm-mono)] leading-relaxed">
                            {action.reads !== '—' && (
                              <span className="block">
                                <span className="text-emerald-600">R</span> {action.reads}
                              </span>
                            )}
                            {action.writes !== '—' && (
                              <span className="block">
                                <span className="text-primary">W</span> {action.writes}
                              </span>
                            )}
                            {action.reads === '—' && action.writes === '—' && '—'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 align-top">
                          <span className="text-[11px] text-muted-foreground">{action.auth}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </TabsContent>

        {/* ── Tab 3: Webhooks ───────────────────────────────────── */}
        <TabsContent value="webhooks" className="pt-6 space-y-8">


          {/* PayRex */}
          <section>
            <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
              PayRex — POST /api/webhooks/payrex
            </p>
            <div className="rounded-xs border border-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/60">
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[35%]">
                      Event
                    </th>
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Database Mutations
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payrexWebhookEvents.map((row) => (
                    <tr key={row.event} className="hover:bg-muted/30 transition-colors duration-150">
                      <td className="px-4 py-3 align-top">
                        <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-foreground">
                          {row.event}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        {row.mutations.map((mutation, mutationIndex) => (
                          <p
                            key={`${row.event}-${mutationIndex}`}
                            className={`text-[11px] text-muted-foreground leading-relaxed${mutationIndex > 0 ? ' mt-1' : ''}`}
                          >
                            {mutation}
                          </p>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-xs border border-border bg-muted/30 px-4 py-3">
              <p className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-[0.1em] text-muted-foreground mb-2">
                Signature Verification
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {webhookSignatureNotes.payrex}
              </p>
            </div>
          </section>

          {/* Shared notes */}
          <section>
            <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-3">
              Shared Conventions
            </p>
            <div className="space-y-2 text-[11px] text-muted-foreground leading-relaxed">
              {sharedWebhookConventions.map((note) => (
                <p key={note}>{note}</p>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
