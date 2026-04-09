import { ROUTES } from '@/lib/routes';
import type { Meta, StoryObj } from '@storybook/react'
import { ArrowRight, Database, Wrench } from '@phosphor-icons/react/dist/ssr'
import { Badge } from '@/components/ui/badge'
import { ActionCard } from './action-card'

const meta = {
  title: 'Shared/ActionCard',
  component: ActionCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/action-card',
      },
    },
  },
  args: {
    title: 'Database tools',
    subtitle: 'Developer portal',
    description: 'Inspect sync health, recent jobs, and operational checks from a single destination.',
  },
} satisfies Meta<typeof ActionCard>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  args: {
    icon: <Database className="text-primary" size={20} />,
    badge: <Badge variant="primary">Canonical</Badge>,
    metadata: <p className="text-xs text-muted-foreground">7 integrity checks passing</p>,
    footer: (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
        Open tools
        <ArrowRight size={14} />
      </span>
    ),
  },
}

export const Grid: Story = {
  render: () => (
    <div className="grid w-[760px] max-w-full gap-4 md:grid-cols-2">
      <ActionCard
        icon={<Database className="text-primary" size={20} />}
        badge={<Badge variant="success">Healthy</Badge>}
        title="Database checks"
        subtitle="Operational status"
        description="Verify replication lag, recent migrations, and queue throughput."
      />
      <ActionCard
        icon={<Wrench className="text-primary" size={20} />}
        title="Developer tools"
        subtitle="Internal workflows"
        description="Keep the developer portal aligned on shared primitives and curated stories."
        href={ROUTES.developer.tools}
        footer={
          <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
            Open destination
            <ArrowRight size={14} />
          </span>
        }
      />
    </div>
  ),
}
