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
  ManualFindingForm,
  ReviewNoteForm,
  StatusUpdateForm,
} from '@/components/admin/ai-audit/AiAuditShared'
import { updateFindingStatus, updateProposalStatus } from '@/lib/actions/admin/ai-audit'
import { getAiAuditArticleDetail, jsonToDisplay } from '@/lib/queries/admin-ai-audit'
import { labelFromValue } from '@/lib/admin/ai-audit-utils'

export const metadata: Metadata = { title: 'AI Audit Article Detail — SlateCamp Admin' }

type PageProps = {
  params: Promise<{ articleId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value
const text = (value: unknown) => typeof value === 'string' && value.trim() ? value : '—'
const dateText = (value: string | null | undefined) => value ? new Date(value).toLocaleString() : 'Never'

function FindingActions({ findingId, returnTo }: { findingId: string; returnTo: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {(['confirmed', 'rejected', 'resolved', 'reopened'] as const).map((status) => (
        <form key={status} action={updateFindingStatus}>
          <input type="hidden" name="findingId" value={findingId} />
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

export default async function AiAuditArticleDetailPage({ params, searchParams }: PageProps) {
  const [{ articleId }, rawSearchParams] = await Promise.all([params, searchParams])
  const data = await getAiAuditArticleDetail(articleId)

  if (!data.article) notFound()

  const returnTo = `/admin/ai-audit/articles/${articleId}`
  const findingId = first(rawSearchParams.findingId ?? rawSearchParams.finding)
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
    ...data.items.map((item) => ({
      id: `item-${item.id}`,
      occurredAt: item.completed_at ?? item.started_at ?? item.created_at,
      title: `${labelFromValue(item.phase)} item ${labelFromValue(item.status)}`,
      description: item.error_message || `Run ${item.run_id?.slice(0, 8) ?? 'manual'} · ${labelFromValue(item.target_type)}`,
      badge: item.status,
      href: item.run_id ? `/admin/ai-audit/runs/${item.run_id}` : undefined,
    })),
    ...data.findings.map((finding) => ({
      id: `finding-${finding.id}`,
      occurredAt: finding.created_at,
      title: finding.finding_summary,
      description: `${labelFromValue(finding.risk_type)} · ${finding.suspect_text ?? 'No suspect snippet'}`,
      badge: finding.status,
      href: `/admin/ai-audit/findings/${finding.id}`,
    })),
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
          <AlertTitle>Article audit detail partially unavailable</AlertTitle>
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="sm">Article</Badge>
              <AuditStatusBadge status={status.latest_status} />
              <AuditSeverityBadge severity={status.highest_severity} />
            </div>
            <CardTitle className="text-2xl">{data.article.title}</CardTitle>
            <CardDescription>
              {data.article.subject_label ?? 'No subject'} · {data.article.difficulty_label ?? 'No difficulty'} · {data.article.slug}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-2 font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-widest text-muted-foreground">Content preview</p>
              <p className="max-h-72 overflow-auto whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {data.article.content?.slice(0, 4000) || 'No article content stored.'}
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Workflow phase</p>
                <div className="mt-1"><AuditPhaseChips phase={status.latest_phase} status={status.latest_status} /></div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Findings</p>
                <p className="font-[family-name:var(--font-dm-mono)] text-sm">{status.open_findings_count}/{status.findings_count} open/total</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last audited</p>
                <p className="text-sm">{dateText(status.last_audited_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual workflow flags</CardTitle>
            <CardDescription>Status cache flags only; live article content is never changed here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Needs source check</span><AuditStatusBadge status={status.needs_source_check ? 'needs_source_check' : 'passed'} /></div>
            <div className="flex items-center justify-between"><span>Needs correction</span><AuditStatusBadge status={status.needs_correction ? 'correction_proposed' : 'passed'} /></div>
            <div className="flex items-center justify-between"><span>Needs human review</span><AuditStatusBadge status={status.needs_human_review ? 'needs_human_review' : 'passed'} /></div>
            <div className="pt-3">
              <Link href={`/admin/ai-audit/questions?articleId=${articleId}`} className="text-xs font-medium text-primary hover:underline">View linked questions</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailSection title="Sources" description="Existing wiki_article_sources rows for source-verification work.">
          {data.sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sources are linked to this article.</p>
          ) : (
            <div className="space-y-3">
              {data.sources.map((source) => (
                <div key={String(source.source_id)} className="rounded-lg border border-border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{text(source.label) || text(source.source_type)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{text(source.description)}</p>
                    </div>
                    <AuditStatusBadge status={source.is_verified ? 'approved' : 'needs_source_check'} />
                  </div>
                  {typeof source.url === 'string' && source.url && (
                    <a href={source.url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-xs text-primary hover:underline">{source.url}</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </DetailSection>

        <DetailSection title="Linked questions" description="First 50 normal questions linked by questions.article_id.">
          {data.questions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No normal questions are linked to this article.</p>
          ) : (
            <div className="space-y-3">
              {data.questions.map((question) => (
                <Link key={String(question.question_id)} href={`/admin/ai-audit/questions/${String(question.question_id)}`} className="block rounded-lg border border-border p-3 hover:bg-muted/40">
                  <p className="line-clamp-2 text-sm font-medium">{text(question.text)}</p>
                  <p className="mt-1 font-[family-name:var(--font-dm-mono)] text-xs text-muted-foreground">Answer: {text(question.correct_option_id)}</p>
                </Link>
              ))}
            </div>
          )}
        </DetailSection>
      </div>

      <DetailSection title="Findings" description="Open, confirmed, rejected, resolved, and reopened findings for this article.">
        {data.findings.length === 0 ? (
          <p className="text-sm text-muted-foreground">No findings yet.</p>
        ) : (
          <div className="space-y-3">
            {data.findings.map((finding) => (
              <div key={finding.id} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <AuditSeverityBadge severity={finding.severity} />
                  <AuditStatusBadge status={finding.status} />
                  <span className="text-xs text-muted-foreground">{labelFromValue(finding.risk_type)}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{finding.finding_summary}</p>
                {finding.suspect_text && <p className="mt-1 text-xs text-muted-foreground">Suspect: {finding.suspect_text}</p>}
                {finding.recommended_next_step && <p className="mt-1 text-xs text-muted-foreground">Next: {finding.recommended_next_step}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <FindingActions findingId={finding.id} returnTo={returnTo} />
                  <Link href={`/admin/ai-audit/findings/${finding.id}`} className="text-xs font-medium text-primary hover:underline">View finding</Link>
                  <Link href={`${returnTo}?finding=${finding.id}`} className="text-xs font-medium text-primary hover:underline">Use for proposal</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title="Staged change proposals" description="Proposal approval is review-only in this MVP; it does not apply content changes.">
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

      <div className="grid gap-6 xl:grid-cols-3">
        <ManualFindingForm targetType="wiki_article" targetId={articleId} articleId={articleId} returnTo={returnTo} />
        <StatusUpdateForm targetType="wiki_article" targetId={articleId} articleId={articleId} returnTo={returnTo} />
        <ChangeProposalForm targetType="wiki_article" targetId={articleId} articleId={articleId} findingId={findingId} returnTo={returnTo} />
      </div>

      <DetailSection title="Review decisions and notes" description="Human audit trail across article, finding, and proposal records.">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {data.decisions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No review decisions yet.</p>
            ) : data.decisions.map((decision) => (
              <div key={decision.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" size="sm">{labelFromValue(decision.decision)}</Badge>
                  <span className="text-xs text-muted-foreground">{labelFromValue(decision.target_type)} · {new Date(decision.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-muted-foreground">{decision.decision_notes || `${decision.previous_status ?? '—'} → ${decision.new_status ?? '—'}`}</p>
              </div>
            ))}
          </div>
          <ReviewNoteForm reviewTargetType="wiki_article" reviewTargetId={articleId} returnTo={returnTo} />
        </div>
      </DetailSection>

      <DetailSection title="Audit timeline" description="Combined run items, findings, staged proposals, and review decisions.">
        <AuditTimeline items={timelineItems} />
      </DetailSection>
    </div>
  )
}
