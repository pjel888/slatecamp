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
import { getAiAuditQuestionDetail, jsonToDisplay } from '@/lib/queries/admin-ai-audit'
import { labelFromValue } from '@/lib/admin/ai-audit-utils'

export const metadata: Metadata = { title: 'AI Audit Question Detail — SlateCamp Admin' }

type PageProps = {
  params: Promise<{ questionId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

type NormalQuestion = {
  question_id: string
  article_id: string | null
  topic_id: string | null
  text: string
  options: unknown
  correct_option_id: string | null
  explanation: unknown
  rationale: unknown
  question_type: string | null
  code_citation: string | null
  updated_at: string | null
}

type DesignScenarioQuestion = {
  question_id: string
  scenario_id: string | null
  question_number: number | null
  question_stem: string
  options: unknown
  correct_answer_index: number | null
  rationale: unknown
  solution_steps: unknown
  question_type: string | null
  code_citation: string | null
  created_at: string | null
}

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value
const dateText = (value: string | null | undefined) => value ? new Date(value).toLocaleString() : 'Never'

const isNormalQuestion = (question: NormalQuestion | DesignScenarioQuestion): question is NormalQuestion => 'text' in question

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

export default async function AiAuditQuestionDetailPage({ params, searchParams }: PageProps) {
  const [{ questionId }, rawSearchParams] = await Promise.all([params, searchParams])
  const data = await getAiAuditQuestionDetail(questionId)

  if (!data.question) notFound()

  const question = data.question as NormalQuestion | DesignScenarioQuestion
  const targetType = data.targetType as 'question' | 'design_scenario_question'
  const normal = isNormalQuestion(question)
  const stem = normal ? question.text : question.question_stem
  const correctAnswer = normal ? question.correct_option_id : question.correct_answer_index == null ? null : String(question.correct_answer_index)
  const rationale = normal ? (question.rationale ?? question.explanation) : (question.rationale ?? question.solution_steps)
  const articleId = normal ? question.article_id : null
  const returnTo = `/admin/ai-audit/questions/${questionId}`
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
          <AlertTitle>Question audit detail partially unavailable</AlertTitle>
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" size="sm">{labelFromValue(targetType)}</Badge>
              <AuditStatusBadge status={status.latest_status} />
              <AuditSeverityBadge severity={status.highest_severity} />
            </div>
            <CardTitle className="text-2xl">Question audit detail</CardTitle>
            <CardDescription>
              {normal ? data.article?.title ?? 'No linked article' : `Design scenario ${question.scenario_id ?? 'unknown'}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <p className="mb-2 font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-widest text-muted-foreground">Stem</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{stem || 'No question stem stored.'}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Correct option</p>
                <p className="font-[family-name:var(--font-dm-mono)] text-sm">{correctAnswer ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Question type</p>
                <p className="text-sm">{question.question_type ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last audited</p>
                <p className="text-sm">{dateText(status.last_audited_at)}</p>
              </div>
            </div>
            <AuditPhaseChips phase={status.latest_phase} status={status.latest_status} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow flags</CardTitle>
            <CardDescription>Status cache only; question content is never modified here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Needs source check</span><AuditStatusBadge status={status.needs_source_check ? 'needs_source_check' : 'passed'} /></div>
            <div className="flex items-center justify-between"><span>Needs correction</span><AuditStatusBadge status={status.needs_correction ? 'correction_proposed' : 'passed'} /></div>
            <div className="flex items-center justify-between"><span>Needs human review</span><AuditStatusBadge status={status.needs_human_review ? 'needs_human_review' : 'passed'} /></div>
            {articleId && (
              <div className="pt-3">
                <Link href={`/admin/ai-audit/articles/${articleId}`} className="text-xs font-medium text-primary hover:underline">View linked article</Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DetailSection title="Options JSON" description="Rendered readably for manual answer-key review.">
          <pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">{jsonToDisplay(question.options)}</pre>
        </DetailSection>
        <DetailSection title="Explanation / rationale" description="Existing rationale snapshot; staged proposals go below.">
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded bg-muted p-3 text-xs">{jsonToDisplay(rationale)}</pre>
        </DetailSection>
      </div>

      <DetailSection title="Findings" description="Question-level suspected or confirmed issues.">
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

      <DetailSection title="Staged change proposals" description="Approval/rejection records only; no live question edits are applied in this MVP.">
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
        <ManualFindingForm targetType={targetType} targetId={questionId} articleId={articleId} questionId={questionId} returnTo={returnTo} />
        <StatusUpdateForm targetType={targetType} targetId={questionId} articleId={articleId} questionId={questionId} returnTo={returnTo} />
        <ChangeProposalForm targetType={targetType} targetId={questionId} articleId={articleId} questionId={questionId} findingId={findingId} returnTo={returnTo} />
      </div>

      <DetailSection title="Review decisions and notes" description="Human audit trail across question, finding, and proposal records.">
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
          <ReviewNoteForm reviewTargetType={targetType} reviewTargetId={questionId} returnTo={returnTo} />
        </div>
      </DetailSection>

      <DetailSection title="Audit timeline" description="Combined run items, findings, staged proposals, and review decisions.">
        <AuditTimeline items={timelineItems} />
      </DetailSection>
    </div>
  )
}
