import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/shared/section-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/shared/CodeBlock'
import { developerArchitectureTechStack } from '@/lib/developer/tech-stack'
import { authGuards, authProviderRows, cronCode, dbClusters, dbFunctions, envVars, masteryLoopCode, middlewareCode, migrations, roleMatrix, sessionLifecycleCode } from '@/lib/developer/architecture-data'

export const metadata = {
  title: 'Architecture — SlateCamp Developer Portal',
  description:
    'System architecture, database schema, authentication, data flow, and deployment for SlateCamp.',
}

/* ------------------------------------------------------------------ */

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-[0.12em] mb-1">
    {children}
  </p>
)

const TableHeader = ({ cols }: { cols: string[] }) => (
  <thead>
    <tr className="border-b border-border">
      {cols.map((col) => (
        <th
          key={col}
          className="px-3 py-2 text-left font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]"
        >
          {col}
        </th>
      ))}
    </tr>
  </thead>
)

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ArchitecturePage() {
  return (
    <div className="max-w-5xl space-y-6">
      <SectionHeader
        eyebrow="Documentation"
        title="Architecture Overview"
        subtitle="Tech stack, database schema, authentication model, data flow, and deployment configuration."
        level="page"
        className="max-w-xl"
      />

      {/* Tabs */}
      <Tabs defaultValue="tech-stack">
        <TabsList variant="underline" className="w-full justify-start">
          <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="auth">Auth &amp; Roles</TabsTrigger>
          <TabsTrigger value="data-flow">Data Flow</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        {/* ---- Tab 1: Tech Stack ---- */}
        <TabsContent value="tech-stack" className="pt-5">
          <Card variant="default" size="sm">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <TableHeader cols={['Component', 'Package', 'Version', 'Notes']} />
                <tbody>
                  {developerArchitectureTechStack.map((row, i) => (
                    <tr
                      key={row.pkg}
                      className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
                    >
                      <td className="px-3 py-2 font-medium text-foreground text-[11px] whitespace-nowrap">
                        {row.label}
                      </td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-primary">
                        {row.pkg}
                      </td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground whitespace-nowrap">
                        {row.version}
                      </td>
                      <td className="px-3 py-2 text-[11px] text-muted-foreground">
                        {row.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Tab 2: Database ---- */}
        <TabsContent value="database" className="pt-5 space-y-4">
          {/* Stats row */}
          <div className="flex gap-4 flex-wrap">
            {[
              { label: 'Tables', value: '50' },
              { label: 'RLS Policies', value: '89' },
              { label: 'Triggers', value: '31' },
              { label: 'Enums', value: '13' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-dm-mono)] text-lg font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-[11px] text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Domain clusters */}
          {dbClusters.map((cluster) => (
            <Card key={cluster.label} variant="default" size="sm">
              <CardContent className="p-0">
                <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border">
                  <Badge variant={cluster.variant} size="sm">
                    {cluster.label}
                  </Badge>
                </div>
                <table className="w-full text-sm">
                  <TableHeader cols={['Table', 'Columns / Notes', 'Access']} />
                  <tbody>
                    {cluster.tables.map((t, i) => (
                      <tr
                        key={t.name}
                        className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
                      >
                        <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-foreground whitespace-nowrap">
                          {t.name}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground">
                          {t.desc}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                          {t.access}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ))}

          {/* DB Functions */}
          <div>
            <SectionLabel>Database Functions</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <TableHeader cols={['Function', 'Description']} />
                  <tbody>
                    {dbFunctions.map((fn, i) => (
                      <tr
                        key={fn.name}
                        className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
                      >
                        <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-foreground whitespace-nowrap">
                          {fn.name}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-muted-foreground">
                          {fn.desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- Tab 3: Auth & Roles ---- */}
        <TabsContent value="auth" className="pt-5 space-y-5">
          {/* Provider info */}
          <Card variant="default" size="sm">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <TableHeader cols={['Property', 'Value']} />
                <tbody>
                  {authProviderRows.map((row, i) => (
                    <tr key={row.k} className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}>
                      <td className="px-3 py-2 font-medium text-[11px] text-foreground whitespace-nowrap">
                        {row.k}
                      </td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                        {row.v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Role matrix */}
          <div>
            <SectionLabel>Role Permissions</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]">
                        Permission
                      </th>
                      {['owner', 'super_admin', 'content_admin', 'sme_reviewer'].map((role) => (
                        <th
                          key={role}
                          className="px-3 py-2 text-center font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground uppercase tracking-[0.1em]"
                        >
                          {role}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {roleMatrix.map((row, i) => (
                      <tr
                        key={row.permission}
                        className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}
                      >
                        <td className="px-3 py-2 text-[11px] text-foreground">
                          {row.permission}
                        </td>
                        {[row.owner, row.super_admin, row.content_admin, row.sme_reviewer].map((allowed, j) => (
                          <td key={j} className="px-3 py-2 text-center text-[13px]">
                            {allowed ? (
                              <span className="text-emerald-600">●</span>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Auth guard functions */}
          <div>
            <SectionLabel>Auth Guard Functions</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="flex flex-wrap gap-2 py-3">
                {authGuards.map((fn) => (
                  <code
                    key={fn}
                    className="font-[family-name:var(--font-dm-mono)] text-[11px] px-2 py-1 rounded bg-muted text-foreground border border-border"
                  >
                    {fn}
                  </code>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Route protection */}
          <div>
            <SectionLabel>Route Protection Flow</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="py-3">
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  {['middleware', 'layout', 'page-level'].map((step, i) => (
                    <span key={step} className="flex items-center gap-2">
                      <code className="font-[family-name:var(--font-dm-mono)] px-2 py-1 rounded bg-muted text-foreground border border-border">
                        {step}
                      </code>
                      {i < 2 && (
                        <span className="text-muted-foreground">→</span>
                      )}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ---- Tab 4: Data Flow ---- */}
        <TabsContent value="data-flow" className="pt-5 space-y-5">
          <div>
            <SectionLabel>Mastery Loop</SectionLabel>
            <CodeBlock code={masteryLoopCode} filename="mastery-loop" />
          </div>

          <div>
            <SectionLabel>Quiz Session Lifecycle</SectionLabel>
            <CodeBlock code={sessionLifecycleCode} filename="session-lifecycle" />
          </div>

          {/* IRT note */}
          <Card variant="accent-left" size="sm" className="border-l-primary">
            <CardContent className="py-3">
              <p className="text-[11px] font-medium text-foreground mb-1">IRT Mandate</p>
              <p className="text-[11px] text-muted-foreground">
                All mastery calculations use the Item Response Theory (IRT) 2-parameter logistic model.
                Parameters: <code className="font-[family-name:var(--font-dm-mono)] text-[11px]">theta</code> (student ability),{' '}
                <code className="font-[family-name:var(--font-dm-mono)] text-[11px]">discrimination</code>,{' '}
                <code className="font-[family-name:var(--font-dm-mono)] text-[11px]">difficulty</code>.
                Mastery weight updates use EMA (Exponential Moving Average).
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Tab 5: Deployment ---- */}
        <TabsContent value="deployment" className="pt-5 space-y-5">
          {/* Platform */}
          <Card variant="default" size="sm">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <TableHeader cols={['Property', 'Value']} />
                <tbody>
                  {[
                    { k: 'Platform', v: 'Vercel (serverless)' },
                    { k: 'Build',    v: 'next build with Turbopack' },
                    { k: 'Runtime',  v: 'Node.js (default)' },
                    { k: 'Region',   v: 'iad1 (US East)' },
                  ].map((row, i) => (
                    <tr key={row.k} className={i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'}>
                      <td className="px-3 py-2 font-medium text-[11px] text-foreground whitespace-nowrap">
                        {row.k}
                      </td>
                      <td className="px-3 py-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                        {row.v}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Cron jobs */}
          <div>
            <SectionLabel>Cron Jobs</SectionLabel>
            <CodeBlock code={cronCode} filename="vercel.json crons" />
          </div>

          {/* Middleware */}
          <div>
            <SectionLabel>Middleware</SectionLabel>
            <CodeBlock code={middlewareCode} filename="middleware.ts" language="typescript" />
          </div>

          {/* Environment variables */}
          <div>
            <SectionLabel>Environment Variables</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card variant="default" size="sm">
                <CardContent className="p-0">
                  <div className="px-3 pt-3 pb-2 border-b border-border">
                    <Badge variant="info" size="sm">Public (NEXT_PUBLIC_*)</Badge>
                  </div>
                  <ul className="py-2">
                    {envVars.public.map((v) => (
                      <li key={v} className="px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                        {v}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card variant="default" size="sm">
                <CardContent className="p-0">
                  <div className="px-3 pt-3 pb-2 border-b border-border">
                    <Badge variant="danger" size="sm">Server-only</Badge>
                  </div>
                  <ul className="py-2">
                    {envVars.server.map((v) => (
                      <li key={v} className="px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                        {v}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Migrations */}
          <div>
            <SectionLabel>Migration Files ({migrations.length})</SectionLabel>
            <Card variant="default" size="sm">
              <CardContent className="p-0">
                <ul className="divide-y divide-border">
                  {migrations.map((m) => (
                    <li key={m} className="px-3 py-1.5 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                      {m}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
