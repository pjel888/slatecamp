import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AuditPhaseChips,
  AuditSeverityBadge,
  AuditStatusBadge,
  AuditTimeline,
  ChangeProposalForm,
  DetailSection,
  ReviewNoteForm,
} from '@/components/admin/ai-audit/AiAuditShared'
import { updateFindingStatus, updateProposalStatus } from '@/lib/actions/admin/ai-audit'
import { getAiAuditFindingDetail, jsonToDisplay } from '@/lib/queries/admin-ai-audit'
import { labelFromValue } from '@/lib/admin/ai-audit-utils'
import type { AiAuditTargetType } from '@/types/ai-audit'

export const metadata: Metadata = { title: 'AI Audit Finding Detail — SlateCamp Admin' }

type PageProps = { params: Promise<{ findingId: string }> }

const dateText = (value: string | null | undefined) => value ? new Date(value).toLocaleString() : 'Never'
const snippet = (value: unknown) => typeof value === 'string' && value.trim() ? value : '—'

function targetHref(targetType: string, targetId: string) {
  if (targetType === 'wiki_article') return `/admin/ai-audit/articles/${targetId}`
  if (targetType === 'question' || targetType === 'design_scenario_question') return `/admin/ai-audit/questions/${targetId}`
  return '/admin/ai-audit'
}

function FindingStatusActions({ findingId, returnTo }: { findingId: string; returnTo: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {(['confirmed', 'rejected', 'resolved', 'reopened'] as const).map((status) => (
        <form key={status} action={updateFindingStatus} className="rounded-lg border border-border p-3">
          <input type="hidden" name="findingId" value={findingId} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <input name="decisionNotes" placeholder="Decision note (optional)" className="mb-2 w-full rounded-sm border border-input bg-background px-3 py-2 text-xs" />
          <button type="submit" className="rounded-sm border border-border px-3 py-2 text-xs font-medium hover:bg-muted">
            {labelFromValue(status)}
          </button>
        </form>
      ))}
    </div>
  )
}

function ProposalActions({ proposalId, returnTo }: { proposalId: string; returnTo: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(['approved', 'rejected', 'needs_edit'] as const).map((status) => (
        <form key={status} action={updateProposalStatus}>
          <input type="hidden" name="proposalId" value={proposalId} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button type="submit" className="rounded-sm border border-border px-2 py-1 text-xs hover:bg-muted">
            {labelFromValue(status)}
          </button>
        </form>
      ))}
    </div>
  )
}

export default async function AiAuditFindingDetailPage({ params }: PageProps) {
  const { findingId } = await params
  const data = await getAiAuditFindingDetail(findingId)

  if (!data.finding) notFound()

  const finding = data.finding
  const returnTo = `/admin/ai-audit/findings/${findingId}`
  const href = targetHref(finding.target_type, finding.target_id)
  const targetTitle = data.article?.title
    ?? data.normalQuestion?.text
    ?? data.designQuestion?.question_stem
    ?? `${labelFromValue(finding.target_type)} ${finding.target_id.slice(0, 8)}`
  const status = data.status ?? {
    latest_phase: 'not_started',
    latest_status: 'not_checked',
    highest_severity: null,
    findings_count: 0,
    open_findings_count: 0,
    needs_source_check: false,
    needs_correction: false,
    needs_human_review: false,
    last_audited_at: null,
  }
  const timelineItems = [
    {
      id: `finding-${finding.id}`,
      occurredAt: finding.created_at,
      title: `Finding created: ${finding.finding_summary}`,
      description: `${labelFromValue(finding.risk_type)} · ${finding.suspect_text ?? 'No suspect snippet'}`,
      badge: finding.status,
    },
    ...(data.item ? [{
      id: `item-${data.item.id}`,
      occurredAt: data.item.completed_at ?? data.item.started_at ?? data.item.created_at,
      title: `${labelFromValue(data.item.phase)} item ${labelFromValue(data.item.status)}`,
      description: data.item.error_message ?? `Run ${data.item.run_id?.slice(0, 8) ?? 'manual'}`,
      badge: data.item.status,
      href: data.item.run_id ? `/admin/ai-audit/runs/${data.item.run_id}` : undefined,
    }] : []),
    ...data.proposals.map((proposal) => ({
      id: `proposal-${proposal.id}`,
      occurredAt: proposal.reviewed_at ?? proposal.created_at,
      title: proposal.diff_summary || labelFromValue(proposal.proposal_type),
      description: proposal.why_changed,
      badge: proposal.status,
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
          <AlertTitle>Finding detail partially unavailable</AlertTitle>
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="sm">Finding</Badge>
              <AuditSeverityBadge severity={finding.severity} />
              <AuditStatusBadge status={finding.status} />
              <Badge variant="outline" size="sm">{labelFromValue(finding.risk_type)}</Badge>
            </div>
            <CardTitle className="text-2xl">{finding.finding_summary}</CardTitle>
            <CardDescription>
              <Link href={href} className="text-primary hover:underline">{targetTitle}</Link> · {dateText(finding.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Target</p>
                <p className="font-[family-name:var(--font-dm-mono)] text-xs">{labelFromValue(finding.target_type)} · {finding.target_id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Provider / model</p>
                <p className="text-sm">{finding.provider}{finding.model ? ` / ${finding.model}` : ''}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Resolved</p>
                <p className="text-sm">{dateText(finding.resolved_at)}</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-2 font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-widest text-muted-foreground">Suspect text</p>
              <p className="whitespace-pre-wrap text-sm">{snippet(finding.suspect_text)}</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-2 font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-widest text-muted-foreground">Rationale and next step</p>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{snippet(finding.ai_rationale_summary)}</p>
              <p className="mt-3 text-sm font-medium">Next: {snippet(finding.recommended_next_step)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target status cache</CardTitle>
            <CardDescription>Derived status; live content is not modified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <AuditPhaseChips phase={status.latest_phase} status={status.latest_status} />
            <div className="flex items-center justify-between"><span>Status</span><AuditStatusBadge status={status.latest_status} /></div>
            <div className="flex items-center justify-between"><span>Open findings</span><span className="font-[family-name:var(--font-dm-mono)] text-xs">{status.open_findings_count}/{status.findings_count}</span></div>
            <div className="flex items-center justify-between"><span>Last audited</span><span className="text-xs text-muted-foreground">{dateText(status.last_audited_at)}</span></div>
            {finding.run_id && <Link href={`/admin/ai-audit/runs/${finding.run_id}`} className="block pt-2 text-xs font-medium text-primary hover:underline">View source run</Link>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailSection title="Finding status actions" description="Confirm, reject, resolve, or reopen this finding. Each action writes a review decision.">
          <FindingStatusActions findingId={finding.id} returnTo={returnTo} />
        </DetailSection>
        <DetailSection title="Add review note" description="Notes are stored in ai_review_decisions.">
          <ReviewNoteForm reviewTargetType="finding" reviewTargetId={finding.id} returnTo={returnTo} />
        </DetailSection>
      </div>

      <ChangeProposalForm
        targetType={finding.target_type as AiAuditTargetType}
        targetId={finding.target_id}
        articleId={finding.article_id}
        questionId={finding.question_id}
        findingId={finding.id}
        returnTo={returnTo}
      />

      <DetailSection title="Staged proposals for this finding/target" description="Approval remains staged-only and does not apply live content.">
        {data.proposals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No staged proposals yet.</p>
        ) : (
          <div className="space-y-3">
            {data.proposals.map((proposal) => (
              <div key={proposal.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <AuditStatusBadge status={proposal.status} />
                  <Badge variant="outline" size="sm">{labelFromValue(proposal.proposal_type)}</Badge>
                </div>
                <p className="mt-2 text-sm font-medium">{proposal.diff_summary || 'No diff summary'}</p>
                <p className="mt-1 text-xs text-muted-foreground">{proposal.why_changed || 'No rationale supplied.'}</p>
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">{jsonToDisplay(proposal.proposed_content)}</pre>
                <div className="mt-3"><ProposalActions proposalId={proposal.id} returnTo={returnTo} /></div>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Audit timeline" description="Finding lifecycle, related proposals, run item, and review decisions.">
        <AuditTimeline items={timelineItems} />
      </DetailSection>
    </div>
  )
}
