import Link from 'next/link'
import { Monitor, Database, FileText, FlaskConical } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'

export const metadata = {
  title: 'Dev Tools — SlateCamp Developer Portal',
  description: 'Developer console, database browser, audit logs, and test data generator.',
}

const tools = [
  {
    title: 'Developer Console',
    description: 'Feature flags, impersonation, system info.',
    icon: Monitor,
    href: ROUTES.DEVELOPER_CONSOLE,
  },
  {
    title: 'Database Browser',
    description: 'Table explorer with row counts and RLS status.',
    icon: Database,
    href: ROUTES.DEVELOPER_DB,
  },
  {
    title: 'Audit Logs',
    description: 'Recent CREATE/UPDATE/DELETE events with actor info.',
    icon: FileText,
    href: ROUTES.DEVELOPER_LOGS,
  },
  {
    title: 'Test Data Generator',
    description: 'Generate mock sessions and organizations.',
    icon: FlaskConical,
    href: ROUTES.DEVELOPER_TEST_DATA,
  },
]

export default function DevToolsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
          Engineering
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground tracking-tight">
          Dev Tools
        </h1>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl mt-1">
          Internal tools for debugging, testing, and inspecting the SlateCamp platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card variant="interactive" size="sm" className="h-full">
              <div className="flex items-center gap-2 mb-1.5">
                <tool.icon className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-semibold text-foreground">{tool.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{tool.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
