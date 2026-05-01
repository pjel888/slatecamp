import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AuditSeverityBadge,
  AuditStatusBadge,
  AuditTimeline,
  DetailSection,
  ManualRunItemForm,
  ReviewNoteForm,
  RunStatusForm,
} from '@/components/admin/ai-audit/AiAuditShared'
import { getAiAuditRunDetail } from '@/lib/queries/admin-ai-audit'
import { labelFromValue } from '@/lib/admin/ai-audit-utils'

export const metadata: Metadata = { title: 'AI Audit Run Detail — SlateCamp Admin' }

type PageProps = { params: Promise<{ runId: string }> }

const dateText = (value: string | null | undefined) => value ? new Date(value).toLocaleString() : '—'

function targetHref(targetType: string, targetId: string) {
  if (targetType === 'wiki_article') return `/admin/ai-audit/articles/${targetId}`
  if (targetType === 'question' || targetType === 'design_scenario_question') return `/admin/ai-audit/questions/${targetId}`
  return '/admin/ai-audit'
}

export default async function AiAuditRunDetailPage({ params }: PageProps) {
  const { runId } = await params
  const data = await getAiAuditRunDetail(runId)

  if (!data.run) notFound()

  const run = data.run
  const returnTo = `/admin/ai-audit/runs/${runId}`
  const timelineItems = [
    {
      id: `run-${run.id}`,
      occurredAt: run.started_at,
      title: `${labelFromValue(run.run_type)} started`,
      description: run.notes,
      badge: run.status,
    },
    ...data.items.map((item) => ({
      id: `item-${item.id}`,
      occurredAt: item.completed_at ?? item.started_at ?? item.created_at,
      title: `${labelFromValue(item.target_type)} ${labelFromValue(item.status)}`,
      description: item.error_message || `${labelFromValue(item.phase)} · ${item.target_id}`,
      badge: item.status,
      href: targetHref(item.target_type, item.target_id),
    })),
    ...data.findings.map((finding) => ({
      id: `finding-${finding.id}`,
      occurredAt: finding.created_at,
      title: finding.finding_summary,
      description: `${labelFromValue(finding.risk_type)} · ${finding.target_id}`,
      badge: finding.status,
      href: `/admin/ai-audit/findings/${finding.id}`,
    })),
    ...data.proposals.map((proposal) => ({
      id: `proposal-${proposal.id}`,
      occurredAt: proposal.reviewed_at ?? proposal.created_at,
      title: proposal.diff_summary || labelFromValue(proposal.proposal_type),
      description: proposal.why_changed,
      badge: proposal.status,
      href: targetHref(proposal.target_type, proposal.target_id),
    })),
    ...data.decisions.map((decision) => ({
      id: `decision-${decision.id}`,
      occurredAt: decision.created_at,
      title: labelFromValue(decision.decision),
      description: decision.decision_notes || `${decision.previous_status ?? '—'} → ${decision.new_status ?? '—'}`,
      badge: decision.target_type,
    })),
  ]

  return (
    <div className="space-y-6">
      {data.error && (
        <Alert variant="warning">
          <AlertTitle>Run detail partially unavailable</AlertTitle>
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="sm">Run</Badge>
              <AuditStatusBadge status={run.status} />
              <Badge variant="outline" size="sm">{labelFromValue(run.phase)}</Badge>
            </div>
            <CardTitle className="text-2xl">{labelFromValue(run.run_type)}</CardTitle>
            <CardDescription>{run.provider}{run.model ? ` / ${run.model}` : ''} · {run.scope_type}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Items</p>
              <p className="font-[family-name:var(--font-dm-mono)] text-sm">{run.completed_items}/{run.total_items} complete</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Flagged</p>
              <p className="font-[family-name:var(--font-dm-mono)] text-sm">{run.flagged_items}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cost estimate</p>
              <p className="font-[family-name:var(--font-dm-mono)] text-sm">{run.cost_estimate_usd ? `$${run.cost_estimate_usd}` : '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Started</p>
              <p className="text-sm">{dateText(run.started_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-sm">{dateText(run.completed_at)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prompt version</p>
              <p className="text-sm">{run.prompt_version ?? '—'}</p>
            </div>
            {run.notes && <p className="md:col-span-3 text-sm text-muted-foreground">{run.notes}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Run controls</CardTitle>
            <CardDescription>Controls update run records only. No AI jobs are started.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <RunStatusForm runId={run.id} returnTo={returnTo} />
            <ReviewNoteForm reviewTargetType="run" reviewTargetId={run.id} returnTo={returnTo} />
          </CardContent>
        </Card>
      </div>

      <ManualRunItemForm runId={run.id} returnTo={returnTo} />

      <DetailSection title="Run items" description="Rows from ai_audit_items for this run.">
        {data.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No run items have been recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Started</th>
                  <th className="px-4 py-3">Completed</th>
                  <th className="px-4 py-3">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.items.map((item) => (
                  <tr key={item.id} className="align-top hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <Link href={targetHref(item.target_type, item.target_id)} className="text-xs font-medium text-primary hover:underline">{labelFromValue(item.target_type)}</Link>
                      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">{item.target_id}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{labelFromValue(item.phase)}</td>
                    <td className="px-4 py-3"><AuditStatusBadge status={item.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{dateText(item.started_at)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{dateText(item.completed_at)}</td>
                    <td className="max-w-[240px] px-4 py-3 text-xs text-muted-foreground">{item.error_message ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DetailSection>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailSection title="Run findings" description="Findings linked to this run.">
          {data.findings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No findings are linked to this run.</p>
          ) : (
            <div className="space-y-3">
              {data.findings.map((finding) => (
                <Link key={finding.id} href={`/admin/ai-audit/findings/${finding.id}`} className="block rounded-lg border border-border p-3 hover:bg-muted/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <AuditSeverityBadge severity={finding.severity} />
                    <AuditStatusBadge status={finding.status} />
                  </div>
                  <p className="mt-2 text-sm font-medium">{finding.finding_summary}</p>
                </Link>
              ))}
            </div>
          )}
        </DetailSection>

        <DetailSection title="Run proposals" description="Staged proposals linked to this run.">
          {data.proposals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No proposals are linked to this run.</p>
          ) : (
            <div className="space-y-3">
              {data.proposals.map((proposal) => (
                <Link key={proposal.id} href={targetHref(proposal.target_type, proposal.target_id)} className="block rounded-lg border border-border p-3 hover:bg-muted/40">
                  <div className="flex flex-wrap items-center gap-2">
                    <AuditStatusBadge status={proposal.status} />
                    <Badge variant="outline" size="sm">{labelFromValue(proposal.proposal_type)}</Badge>
                  </div>
                  <p className="mt-2 text-sm font-medium">{proposal.diff_summary || 'No diff summary'}</p>
                </Link>
              ))}
            </div>
          )}
        </DetailSection>
      </div>

      <DetailSection title="Run timeline" description="Run lifecycle, items, findings, proposals, and review decisions.">
        <AuditTimeline items={timelineItems} />
      </DetailSection>
    </div>
  )
}
