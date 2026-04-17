import { Monitor, Database, FileText, Flask } from '@phosphor-icons/react/dist/ssr'
import { ActionCard } from '@/components/shared/action-card'
import { SectionHeader } from '@/components/shared/section-header'
import { developerToolSurfaces } from '@/lib/developer/surface-registry'

export const metadata = {
  title: 'Dev Tools — SlateCamp Developer Portal',
  description: 'Developer console, database browser, audit logs, and test data generator.',
}

const toolIconMap = {
  console: Monitor,
  database: Database,
  logs: FileText,
  testData: Flask,
} as const

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
        {developerToolSurfaces.map((tool) => {
          const Icon = toolIconMap[tool.iconKey]
          return (
            <ActionCard
              key={tool.href}
              href={tool.href}
              title={tool.title}
              description={tool.description}
              icon={<Icon className="h-4 w-4 text-primary" />}
            />
          )
        })}
      </div>
    </div>
  )
}
