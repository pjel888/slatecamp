import { Monitor, Database, FileText, Flask } from '@phosphor-icons/react/dist/ssr'
import { ActionCard } from '@/components/shared/action-card'
import { SectionHeader } from '@/components/shared/section-header'
import { ROUTES } from '@/lib/routes'

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
    icon: Flask,
    href: ROUTES.DEVELOPER_TEST_DATA,
  },
]

export default function DevToolsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <SectionHeader
        eyebrow="Engineering"
        title="Dev Tools"
        subtitle="Internal tools for debugging, testing, and inspecting the SlateCamp platform."
        level="page"
        className="max-w-xl"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => (
          <ActionCard
            key={tool.href}
            href={tool.href}
            title={tool.title}
            description={tool.description}
            icon={<tool.icon className="h-4 w-4 text-primary" />}
          />
        ))}
      </div>
    </div>
  )
}
