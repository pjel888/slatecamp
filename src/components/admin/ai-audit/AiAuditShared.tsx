import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/shared/empty-state'
import { SectionHeader } from '@/components/shared/section-header'
import {
  AI_AUDIT_PHASES,
  AI_AUDIT_RISK_TYPES,
  AI_AUDIT_SEVERITIES,
  AI_AUDIT_STATUSES,
  AI_AUDIT_TARGET_TYPES,
  AI_CHANGE_PROPOSAL_TYPES,
  type AiAuditPhase,
  type AiAuditTargetType,
} from '@/types/ai-audit'
import {
  buildPageHref,
  getAiAuditBadgeVariant,
  getSeverityBadgeVariant,
  labelFromValue,
} from '@/lib/admin/ai-audit-utils'
import {
  addReviewDecisionNote,
  createChangeProposal,
  createManualAuditRunItem,
  createManualAuditRun,
  createManualFinding,
  updateAuditTargetStatus,
  updateAuditRunStatus,
} from '@/lib/actions/admin/ai-audit'
import { cn } from '@/lib/utils'

export const AI_AUDIT_ROOT = '/admin/ai-audit'

const tabs = [
  { label: 'Overview', href: AI_AUDIT_ROOT },
  { label: 'Articles', href: `${AI_AUDIT_ROOT}/articles` },
  { label: 'Questions', href: `${AI_AUDIT_ROOT}/questions` },
  { label: 'Findings', href: `${AI_AUDIT_ROOT}/findings` },
  { label: 'Runs', href: `${AI_AUDIT_ROOT}/runs` },
  { label: 'Proposals', href: `${AI_AUDIT_ROOT}/proposals` },
]

export function AiAuditPageHeader() {
  return (
    <div className="space-y-4">
      <SectionHeader
        eyebrow="Quality workflow"
        title="AI Audit Control Center"
        subtitle="Monitor article and question audit readiness, findings, correction proposals, and human review status."
        level="page"
      />
      <nav className="flex flex-wrap gap-2 border-b border-border pb-2" aria-label="AI audit sections">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-sm px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export function AuditStatusBadge({ status }: { status?: string | null }) {
  return (
    <Badge variant={getAiAuditBadgeVariant(status)} size="sm" decoration="dot">
      {labelFromValue(status ?? 'not_checked')}
    </Badge>
  )
}

export function AuditSeverityBadge({ severity }: { severity?: string | null }) {
  return (
    <Badge variant={getSeverityBadgeVariant(severity)} size="sm" decoration={severity ? 'dot' : 'none'}>
      {labelFromValue(severity)}
    </Badge>
  )
}

export function AuditPhaseChips({ phase, status }: { phase?: string | null; status?: string | null }) {
  const items: Array<{ phase: AiAuditPhase; label: string }> = [
    { phase: 'tier0_static_check', label: 'T0 Static' },
    { phase: 'tier1_ai_flag_scan', label: 'T1 Flag' },
    { phase: 'tier2_source_verification', label: 'T2 Source' },
    { phase: 'tier3_correction_proposal', label: 'T3 Correct' },
    { phase: 'tier4_validation', label: 'T4 Validate' },
    { phase: 'human_review', label: 'Review' },
  ]
  const currentIndex = items.findIndex((item) => item.phase === phase)
  const isProblem = status === 'failed' || status === 'confirmed_wrong' || status === 'likely_wrong'

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item, index) => {
        const complete = currentIndex >= index && !isProblem
        const active = item.phase === phase
        return (
          <span
            key={item.phase}
            className={cn(
              'rounded border px-1.5 py-0.5 font-[family-name:var(--font-dm-mono)] text-[10px] uppercase tracking-widest',
              complete && 'border-success/30 bg-success-50 text-success-800',
              active && !complete && 'border-warning/30 bg-warning-50 text-warning-700',
              !complete && !active && 'border-border bg-muted text-muted-foreground',
            )}
          >
            {complete ? '✓ ' : active ? '! ' : '– '}{item.label}
          </span>
        )
      })}
    </div>
  )
}

export function AuditEmptyState({ title = 'No AI audit records yet', description = 'Start by creating a manual finding or marking a row reviewed. Future AI workers will write into this same workflow.' }: { title?: string; description?: string }) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={(
        <div className="flex flex-wrap justify-center gap-2">
          <Link className="rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground" href={`${AI_AUDIT_ROOT}/articles`}>View Articles</Link>
          <Link className="rounded-sm border border-border px-3 py-2 text-xs font-medium" href={`${AI_AUDIT_ROOT}/questions`}>View Questions</Link>
          <Link className="rounded-sm border border-border px-3 py-2 text-xs font-medium" href={`${AI_AUDIT_ROOT}/findings`}>Create Finding</Link>
        </div>
      )}
    />
  )
}

export function StatCard({ label, value, description, tone = 'default' }: { label: string; value: number | string; description?: string; tone?: 'default' | 'green' | 'yellow' | 'orange' | 'red' | 'blue' }) {
  const toneClasses = {
    default: 'border-border',
    green: 'border-l-success',
    yellow: 'border-l-warning',
    orange: 'border-l-camp-orange',
    red: 'border-l-destructive',
    blue: 'border-l-primary',
  }

  return (
    <Card className={cn('border-l-[3px]', toneClasses[tone])}>
      <CardHeader className="pb-0">
        <CardDescription className="font-[family-name:var(--font-dm-mono)] text-[11px] uppercase tracking-widest">{label}</CardDescription>
        <CardTitle className="font-[family-name:var(--font-dm-mono)] text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
      {description && <CardContent className="pt-2 text-xs text-muted-foreground">{description}</CardContent>}
    </Card>
  )
}

export function PaginationControls({ basePath, searchParams, page, pageSize, total }: { basePath: string; searchParams: URLSearchParams; page: number; pageSize: number; total: number }) {
  const maxPage = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
      <p className="text-muted-foreground">
        Page <span className="font-[family-name:var(--font-dm-mono)] text-foreground">{page}</span> of <span className="font-[family-name:var(--font-dm-mono)] text-foreground">{maxPage}</span> · {total.toLocaleString()} rows
      </p>
      <div className="flex gap-2">
        <Link
          aria-disabled={page <= 1}
          className={cn('rounded-sm border border-border px-3 py-1.5 text-xs font-medium', page <= 1 && 'pointer-events-none opacity-50')}
          href={buildPageHref(basePath, searchParams, Math.max(1, page - 1))}
        >
          Previous
        </Link>
        <Link
          aria-disabled={page >= maxPage}
          className={cn('rounded-sm border border-border px-3 py-1.5 text-xs font-medium', page >= maxPage && 'pointer-events-none opacity-50')}
          href={buildPageHref(basePath, searchParams, Math.min(maxPage, page + 1))}
        >
          Next
        </Link>
      </div>
    </div>
  )
}

export function AuditFilterForm({ action, defaults = {}, showTargetType = false, showRisk = false, showSubject = false, showSourceFilters = false, placeholder = 'Search', showQuestionFilters = false, showLastAudited = false }: { action: string; defaults?: Record<string, string | undefined>; showTargetType?: boolean; showRisk?: boolean; showSubject?: boolean; showSourceFilters?: boolean; showQuestionFilters?: boolean; showLastAudited?: boolean; placeholder?: string }) {
  return (
    <form action={action} className="grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-6">
      <input
        name="q"
        defaultValue={defaults.q ?? ''}
        placeholder={placeholder}
        className="rounded-sm border border-input bg-background px-3 py-2 text-sm md:col-span-2"
      />
      <select name="status" defaultValue={defaults.status ?? ''} className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
        <option value="">All statuses</option>
        {AI_AUDIT_STATUSES.map((status) => <option key={status} value={status}>{labelFromValue(status)}</option>)}
      </select>
      <select name="phase" defaultValue={defaults.phase ?? ''} className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
        <option value="">All phases</option>
        {AI_AUDIT_PHASES.map((phase) => <option key={phase} value={phase}>{labelFromValue(phase)}</option>)}
      </select>
      <select name="severity" defaultValue={defaults.severity ?? ''} className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
        <option value="">All severity</option>
        {AI_AUDIT_SEVERITIES.map((severity) => <option key={severity} value={severity}>{labelFromValue(severity)}</option>)}
      </select>
      {showTargetType && (
        <select name="targetType" defaultValue={defaults.targetType ?? ''} className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
          <option value="">All targets</option>
          {AI_AUDIT_TARGET_TYPES.map((target) => <option key={target} value={target}>{labelFromValue(target)}</option>)}
        </select>
      )}
      {showRisk && (
        <select name="riskType" defaultValue={defaults.riskType ?? ''} className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
          <option value="">All risk types</option>
          {AI_AUDIT_RISK_TYPES.map((risk) => <option key={risk} value={risk}>{labelFromValue(risk)}</option>)}
        </select>
      )}
      {showSubject && (
        <input name="subject" defaultValue={defaults.subject ?? ''} placeholder="Subject label" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
      )}
      {showSourceFilters && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <input type="checkbox" name="missingSources" value="true" defaultChecked={defaults.missingSources === 'true'} /> Missing sources
        </label>
      )}
      {showLastAudited && (
        <>
          <input type="date" name="lastAuditedSince" defaultValue={defaults.lastAuditedSince ?? ''} aria-label="Last audited since" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" name="neverAudited" value="true" defaultChecked={defaults.neverAudited === 'true'} /> Never audited
          </label>
        </>
      )}
      {showQuestionFilters && (
        <>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" name="missingArticle" value="true" defaultChecked={defaults.missingArticle === 'true'} /> Missing article
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" name="missingAnswerKey" value="true" defaultChecked={defaults.missingAnswerKey === 'true'} /> Missing answer key
          </label>
        </>
      )}
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="needsHumanReview" value="true" defaultChecked={defaults.needsHumanReview === 'true'} /> Human review
      </label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="needsSourceCheck" value="true" defaultChecked={defaults.needsSourceCheck === 'true'} /> Source check
      </label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="needsCorrection" value="true" defaultChecked={defaults.needsCorrection === 'true'} /> Correction
      </label>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <input type="checkbox" name="hasOpenFindings" value="true" defaultChecked={defaults.hasOpenFindings === 'true'} /> Open findings
      </label>
      <div className="flex gap-2 md:col-span-2">
        <button className="rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground" type="submit">Apply filters</button>
        <Link href={action} className="rounded-sm border border-border px-3 py-2 text-xs font-medium">Clear</Link>
      </div>
    </form>
  )
}

export function ManualFindingForm({ targetType, targetId, articleId, questionId, returnTo }: { targetType: AiAuditTargetType; targetId: string; articleId?: string | null; questionId?: string | null; returnTo: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create manual finding</CardTitle>
        <CardDescription>Manual entries use provider=manual and do not call AI APIs.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createManualFinding} className="grid gap-3">
          <HiddenTarget targetType={targetType} targetId={targetId} articleId={articleId} questionId={questionId} returnTo={returnTo} />
          <input name="findingSummary" required placeholder="Finding summary" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <div className="grid gap-3 md:grid-cols-3">
            <select name="severity" defaultValue="medium" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
              {AI_AUDIT_SEVERITIES.map((severity) => <option key={severity} value={severity}>{labelFromValue(severity)}</option>)}
            </select>
            <select name="riskType" defaultValue="other" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
              {AI_AUDIT_RISK_TYPES.map((risk) => <option key={risk} value={risk}>{labelFromValue(risk)}</option>)}
            </select>
            <select name="confidence" defaultValue="medium" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
              <option value="low">Low confidence</option>
              <option value="medium">Medium confidence</option>
              <option value="high">High confidence</option>
            </select>
          </div>
          <textarea name="suspectText" placeholder="Suspect text snippet" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <textarea name="rationaleSummary" placeholder="Rationale / why this is risky" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <input name="recommendedNextStep" placeholder="Recommended next step" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" className="w-fit rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Create finding</button>
        </form>
      </CardContent>
    </Card>
  )
}

export function GlobalManualFindingForm({ returnTo }: { returnTo: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create manual finding</CardTitle>
        <CardDescription>Use this when you are logging from the global findings queue. This stores audit data only.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createManualFinding} className="grid gap-3 md:grid-cols-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <select name="targetType" defaultValue="wiki_article" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_AUDIT_TARGET_TYPES.map((target) => <option key={target} value={target}>{labelFromValue(target)}</option>)}
          </select>
          <input name="targetId" required placeholder="Target ID" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <input name="articleId" placeholder="Article ID (optional)" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <input name="questionId" placeholder="Question ID (optional)" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <input name="findingSummary" required placeholder="Finding summary" className="rounded-sm border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
          <select name="severity" defaultValue="medium" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_AUDIT_SEVERITIES.map((severity) => <option key={severity} value={severity}>{labelFromValue(severity)}</option>)}
          </select>
          <select name="riskType" defaultValue="other" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_AUDIT_RISK_TYPES.map((risk) => <option key={risk} value={risk}>{labelFromValue(risk)}</option>)}
          </select>
          <textarea name="suspectText" placeholder="Suspect text snippet" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
          <textarea name="rationaleSummary" placeholder="Rationale / why this is risky" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
          <input name="recommendedNextStep" placeholder="Recommended next step" className="rounded-sm border border-input bg-background px-3 py-2 text-sm md:col-span-3" />
          <button type="submit" className="w-fit rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Create finding</button>
        </form>
      </CardContent>
    </Card>
  )
}

export function StatusUpdateForm({ targetType, targetId, articleId, questionId, returnTo }: { targetType: AiAuditTargetType; targetId: string; articleId?: string | null; questionId?: string | null; returnTo: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual status update</CardTitle>
        <CardDescription>Update audit workflow state only. Live content is not modified.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={updateAuditTargetStatus} className="grid gap-3 md:grid-cols-2">
          <HiddenTarget targetType={targetType} targetId={targetId} articleId={articleId} questionId={questionId} returnTo={returnTo} />
          <select name="phase" defaultValue="human_review" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_AUDIT_PHASES.map((phase) => <option key={phase} value={phase}>{labelFromValue(phase)}</option>)}
          </select>
          <select name="status" defaultValue="passed" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_AUDIT_STATUSES.map((status) => <option key={status} value={status}>{labelFromValue(status)}</option>)}
          </select>
          <textarea name="decisionNotes" placeholder="Review note" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
          <label className="flex items-center gap-2 text-xs text-muted-foreground md:col-span-2">
            <input type="checkbox" name="overrideOpenFindings" value="true" />
            Explicitly override open findings. Requires a review note; otherwise passed/approved/published is downgraded to human review.
          </label>
          <button type="submit" className="w-fit rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Save status</button>
        </form>
      </CardContent>
    </Card>
  )
}

export function ChangeProposalForm({ targetType, targetId, articleId, questionId, findingId, returnTo }: { targetType: AiAuditTargetType; targetId: string; articleId?: string | null; questionId?: string | null; findingId?: string | null; returnTo: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create staged proposal</CardTitle>
        <CardDescription>Proposals are staged review records only and are never applied to live content in this MVP.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createChangeProposal} className="grid gap-3">
          <HiddenTarget targetType={targetType} targetId={targetId} articleId={articleId} questionId={questionId} returnTo={returnTo} />
          {findingId && <input type="hidden" name="findingId" value={findingId} />}
          <select name="proposalType" defaultValue={targetType === 'wiki_article' ? 'article_edit' : 'question_edit'} className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_CHANGE_PROPOSAL_TYPES.map((type) => <option key={type} value={type}>{labelFromValue(type)}</option>)}
          </select>
          <textarea name="diffSummary" placeholder="Diff summary" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <textarea name="whyChanged" placeholder="Why this change is proposed" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <textarea name="oldContent" placeholder="Old content JSON or plain text snapshot" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 font-[family-name:var(--font-dm-mono)] text-xs" />
          <textarea name="proposedContent" placeholder="Proposed content JSON or plain text" className="min-h-24 rounded-sm border border-input bg-background px-3 py-2 font-[family-name:var(--font-dm-mono)] text-xs" />
          <textarea name="sourceEvidence" placeholder="Source evidence notes, one per line" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" className="w-fit rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Create staged proposal</button>
        </form>
      </CardContent>
    </Card>
  )
}

export function ReviewNoteForm({ reviewTargetType, reviewTargetId, returnTo }: { reviewTargetType: string; reviewTargetId: string; returnTo: string }) {
  return (
    <form action={addReviewDecisionNote} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <input type="hidden" name="reviewTargetType" value={reviewTargetType} />
      <input type="hidden" name="reviewTargetId" value={reviewTargetId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <textarea name="decisionNotes" required placeholder="Add review note" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm" />
      <button type="submit" className="w-fit rounded-sm border border-border px-3 py-2 text-xs font-medium">Add note</button>
    </form>
  )
}

export function ManualRunForm({ returnTo }: { returnTo: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Record manual run</CardTitle>
        <CardDescription>This logs a manual/admin workflow operation. It does not start AI jobs.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createManualAuditRun} className="grid gap-3 md:grid-cols-3">
          <input type="hidden" name="returnTo" value={returnTo} />
          <input name="runType" defaultValue="manual_review" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <input name="scopeType" defaultValue="manual" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <select name="runStatus" defaultValue="completed" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {['queued', 'running', 'completed', 'failed', 'cancelled'].map((status) => <option key={status} value={status}>{labelFromValue(status)}</option>)}
          </select>
          <select name="phase" defaultValue="human_review" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_AUDIT_PHASES.map((phase) => <option key={phase} value={phase}>{labelFromValue(phase)}</option>)}
          </select>
          <input name="totalItems" inputMode="numeric" placeholder="Total items" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <input name="completedItems" inputMode="numeric" placeholder="Completed" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <input name="flaggedItems" inputMode="numeric" placeholder="Flagged" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <textarea name="notes" placeholder="Notes" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm md:col-span-3" />
          <button type="submit" className="w-fit rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Record run</button>
        </form>
      </CardContent>
    </Card>
  )
}

export function RunStatusForm({ runId, returnTo }: { runId: string; returnTo: string }) {
  return (
    <form action={updateAuditRunStatus} className="grid gap-2 rounded-lg border border-border bg-card p-3 md:grid-cols-[1fr_2fr_auto]">
      <input type="hidden" name="runId" value={runId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <select name="runStatus" defaultValue="completed" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
        {['queued', 'running', 'completed', 'failed', 'cancelled'].map((status) => <option key={status} value={status}>{labelFromValue(status)}</option>)}
      </select>
      <input name="decisionNotes" placeholder="Status note (optional)" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
      <button type="submit" className="rounded-sm border border-border px-3 py-2 text-xs font-medium hover:bg-muted">Update run</button>
    </form>
  )
}

export function ManualRunItemForm({ runId, returnTo }: { runId: string; returnTo: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add manual run item</CardTitle>
        <CardDescription>Records one item processed by this manual/admin run. It does not start an AI worker.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createManualAuditRunItem} className="grid gap-3 md:grid-cols-4">
          <input type="hidden" name="runId" value={runId} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <select name="targetType" defaultValue="wiki_article" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_AUDIT_TARGET_TYPES.map((target) => <option key={target} value={target}>{labelFromValue(target)}</option>)}
          </select>
          <input name="targetId" required placeholder="Target ID" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <input name="articleId" placeholder="Article ID (optional)" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <input name="questionId" placeholder="Question ID (optional)" className="rounded-sm border border-input bg-background px-3 py-2 text-sm" />
          <select name="phase" defaultValue="human_review" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_AUDIT_PHASES.map((phase) => <option key={phase} value={phase}>{labelFromValue(phase)}</option>)}
          </select>
          <select name="status" defaultValue="passed" className="rounded-sm border border-input bg-background px-3 py-2 text-sm">
            {AI_AUDIT_STATUSES.map((status) => <option key={status} value={status}>{labelFromValue(status)}</option>)}
          </select>
          <input name="errorMessage" placeholder="Error message (optional)" className="rounded-sm border border-input bg-background px-3 py-2 text-sm md:col-span-2" />
          <textarea name="notes" placeholder="Item notes" className="min-h-20 rounded-sm border border-input bg-background px-3 py-2 text-sm md:col-span-4" />
          <button type="submit" className="w-fit rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground">Add run item</button>
        </form>
      </CardContent>
    </Card>
  )
}

export type AuditTimelineItem = {
  id: string
  occurredAt: string | null | undefined
  title: string
  description?: string | null
  badge?: string | null
  href?: string
}

export function AuditTimeline({ items }: { items: AuditTimelineItem[] }) {
  const sortedItems = [...items].sort((a, b) => {
    const aTime = a.occurredAt ? new Date(a.occurredAt).getTime() : 0
    const bTime = b.occurredAt ? new Date(b.occurredAt).getTime() : 0
    return bTime - aTime
  })

  if (sortedItems.length === 0) return <p className="text-sm text-muted-foreground">No timeline events yet.</p>

  return (
    <ol className="relative space-y-3 border-l border-border pl-4">
      {sortedItems.map((item) => {
        const content = (
          <div className="rounded-lg border border-border bg-card p-3 hover:bg-muted/30">
            <div className="flex flex-wrap items-center gap-2">
              {item.badge && <Badge variant="outline" size="sm">{labelFromValue(item.badge)}</Badge>}
              <span className="text-xs text-muted-foreground">{item.occurredAt ? new Date(item.occurredAt).toLocaleString() : 'No timestamp'}</span>
            </div>
            <p className="mt-2 text-sm font-medium">{item.title}</p>
            {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}
          </div>
        )
        return (
          <li key={item.id} className="relative">
            <span className="absolute -left-[21px] top-4 h-2 w-2 rounded-full bg-primary" />
            {item.href ? <Link href={item.href}>{content}</Link> : content}
          </li>
        )
      })}
    </ol>
  )
}

export function MetricDistribution({ title, description, items }: { title: string; description?: string; items: Array<{ label: string; value: number; tone: 'default' | 'green' | 'yellow' | 'orange' | 'red' | 'blue' }> }) {
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const toneClasses = {
    default: 'bg-muted-foreground/50',
    green: 'bg-success',
    yellow: 'bg-warning',
    orange: 'bg-camp-orange',
    red: 'bg-destructive',
    blue: 'bg-primary',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-3 overflow-hidden rounded-full bg-muted">
          {items.map((item) => (
            <span
              key={item.label}
              className={toneClasses[item.tone]}
              style={{ width: total > 0 ? `${Math.max(2, (item.value / total) * 100)}%` : '0%' }}
              title={`${item.label}: ${item.value}`}
            />
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-[family-name:var(--font-dm-mono)] text-xs">{item.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function HiddenTarget({ targetType, targetId, articleId, questionId, returnTo }: { targetType: AiAuditTargetType; targetId: string; articleId?: string | null; questionId?: string | null; returnTo: string }) {
  return (
    <>
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      {articleId && <input type="hidden" name="articleId" value={articleId} />}
      {questionId && <input type="hidden" name="questionId" value={questionId} />}
      <input type="hidden" name="returnTo" value={returnTo} />
    </>
  )
}

export function DetailSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
