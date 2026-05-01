import Link from 'next/link'
import type { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { getAiAuditDashboardData } from '@/lib/queries/admin-ai-audit'
import { AuditEmptyState, AuditSeverityBadge, AuditStatusBadge, MetricDistribution, StatCard } from '@/components/admin/ai-audit/AiAuditShared'
import { labelFromValue } from '@/lib/admin/ai-audit-utils'

export const metadata: Metadata = { title: 'AI Audit Control Center — SlateCamp Admin' }

export default async function AiAuditDashboardPage() {
  const { summary, recentFindings, recentRuns, pendingProposals, highPriorityFindings, error } = await getAiAuditDashboardData()
  const hasAnyAuditData = summary.open_findings > 0 || summary.total_runs > 0 || summary.pending_proposals > 0

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="warning">
          <AlertTitle>Audit data partially unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Articles" value={summary.total_articles} description="Wiki articles in scope" />
        <StatCard label="Not Checked" value={summary.articles_not_checked} description="Articles with no audit result" tone="default" />
        <StatCard label="T0 Complete" value={summary.tier0_complete} description="Static/manual tier rows complete" tone="green" />
        <StatCard label="T1 Flag Scan" value={summary.tier1_complete} description="Future-ready AI flag phase" tone="green" />
        <StatCard label="Needs Source Check" value={summary.needs_source_check} description="Rows needing source verification" tone="yellow" />
        <StatCard label="Likely / High Risk" value={summary.likely_or_confirmed_issues} description="Likely wrong, confirmed wrong, or high severity" tone="red" />
        <StatCard label="Open Findings" value={summary.open_findings} description="Open, confirmed, or reopened findings" tone="orange" />
        <StatCard label="Correction Proposed" value={summary.correction_proposed} description="Staged proposals awaiting review" tone="blue" />
        <StatCard label="Needs Human Review" value={summary.needs_human_review} description="Manual review queue" tone="yellow" />
        <StatCard label="Approved" value={summary.approved} description="Accepted audit status" tone="green" />
        <StatCard label="Published" value={summary.published} description="Published audit status" tone="green" />
        <StatCard label="Total Questions" value={summary.total_questions + summary.total_design_scenario_questions} description="Normal + design scenario questions" />
        <StatCard label="Questions Flagged" value={summary.questions_flagged} description="Question targets needing attention" tone="orange" />
        <StatCard label="Answer Key Risks" value={summary.answer_key_risks} description="Answer-key or missing-key findings" tone="red" />
        <StatCard label="Multiple Answer Risks" value={summary.multiple_answer_risks} description="Multiple correct-answer findings" tone="red" />
        <StatCard label="Audit Runs" value={summary.total_runs} description="Manual/admin run records" tone="blue" />
      </div>

      {!hasAnyAuditData && <AuditEmptyState />}

      <div className="grid gap-6 xl:grid-cols-2">
        <MetricDistribution
          title="Workflow status distribution"
          description="Status cache counts across audit targets."
          items={[
            { label: 'Not checked', value: summary.status_not_checked, tone: 'default' },
            { label: 'Passed', value: summary.status_passed, tone: 'green' },
            { label: 'Flagged', value: summary.status_flagged, tone: 'orange' },
            { label: 'Needs source check', value: summary.status_needs_source_check, tone: 'yellow' },
            { label: 'Likely wrong', value: summary.status_likely_wrong, tone: 'orange' },
            { label: 'Confirmed wrong', value: summary.status_confirmed_wrong, tone: 'red' },
            { label: 'Correction proposed', value: summary.status_correction_proposed, tone: 'blue' },
            { label: 'Needs human review', value: summary.status_needs_human_review, tone: 'yellow' },
            { label: 'Approved', value: summary.status_approved, tone: 'green' },
            { label: 'Published', value: summary.status_published, tone: 'green' },
          ]}
        />
        <MetricDistribution
          title="Open finding severity distribution"
          description="Open, confirmed, and reopened findings by severity."
          items={[
            { label: 'Low', value: summary.severity_low, tone: 'blue' },
            { label: 'Medium', value: summary.severity_medium, tone: 'yellow' },
            { label: 'High', value: summary.severity_high, tone: 'orange' },
            { label: 'Critical', value: summary.severity_critical, tone: 'red' },
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>High-priority queue</CardTitle>
            <CardDescription>Critical/high findings first; this is the safest next-work list.</CardDescription>
          </CardHeader>
          <CardContent>
            {highPriorityFindings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No high-priority open findings yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {highPriorityFindings.map((finding) => (
                  <Link key={finding.id} href={`/admin/ai-audit/findings/${finding.id}`} className="block py-3 hover:bg-muted/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{finding.finding_summary}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{labelFromValue(finding.target_type)} · {finding.target_id.slice(0, 8)}</p>
                      </div>
                      <AuditSeverityBadge severity={finding.severity} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items needing human review</CardTitle>
            <CardDescription>Staged proposals and review-dependent workflow states.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingProposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No staged proposals are waiting for review.</p>
            ) : (
              <div className="divide-y divide-border">
                {pendingProposals.map((proposal) => (
                  <Link key={proposal.id} href="/admin/ai-audit/proposals" className="block py-3 hover:bg-muted/40">
                    <p className="text-sm font-medium">{proposal.diff_summary || labelFromValue(proposal.proposal_type)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{labelFromValue(proposal.target_type)} · {proposal.target_id.slice(0, 8)}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent findings</CardTitle>
            <CardDescription>Manual/static findings now; future AI provider/model fields may be null.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFindings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No findings have been logged yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentFindings.map((finding) => (
                  <div key={finding.id} className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <AuditSeverityBadge severity={finding.severity} />
                      <AuditStatusBadge status={finding.status} />
                      <span className="text-xs text-muted-foreground">{finding.provider}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium">{finding.finding_summary}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
            <CardDescription>Run records are logs only. No AI jobs are started from this MVP.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit run records yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentRuns.map((run) => (
                  <div key={run.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{labelFromValue(run.run_type)}</p>
                      <p className="text-xs text-muted-foreground">{run.provider} · {run.completed_items}/{run.total_items} complete</p>
                    </div>
                    <AuditStatusBadge status={run.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link className="rounded-sm bg-primary px-3 py-2 text-xs font-medium text-primary-foreground" href="/admin/ai-audit/articles">View Articles</Link>
        <Link className="rounded-sm border border-border px-3 py-2 text-xs font-medium" href="/admin/ai-audit/questions">View Questions</Link>
        <Link className="rounded-sm border border-border px-3 py-2 text-xs font-medium" href="/admin/ai-audit/findings">Findings Log</Link>
        <Link className="rounded-sm border border-border px-3 py-2 text-xs font-medium" href="/admin/ai-audit/runs">Runs Log</Link>
        <Link className="rounded-sm border border-border px-3 py-2 text-xs font-medium" href="/admin/ai-audit/proposals">Proposals</Link>
      </div>
    </div>
  )
}
