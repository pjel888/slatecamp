'use client'

import {
  LayoutGrid,
  Palette,
  Activity,
  Database,
  Server,
  Wrench,
  Monitor,
  FlaskConical,
  BookOpen,
  Boxes,
  ScrollText,
} from 'lucide-react'
import { PortalLayout } from '@/components/portal'
import { Badge } from '@/components/ui/badge'
import { DevPortalSearch } from './DevPortalSearch'
import type { NavGroup } from '@/components/portal'

const devNavItems: NavGroup[] = [
  {
    label: 'Portal',
    items: [
      { href: '/developer', label: 'Overview', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Design System',
    items: [
      { href: '/developer/design-system', label: 'Overview', icon: <Palette className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Wiki Article',
    items: [
      {
        href: '/developer/design-system/wiki',
        label: 'Wiki Article',
        children: [
          { label: 'WikiCard', href: '/developer/design-system/wiki/wiki-card' },
          { label: 'ArticleRenderer', href: '/developer/design-system/wiki/article-renderer' },
          { label: 'TableOfContents', href: '/developer/design-system/wiki/table-of-contents' },
          { label: 'BreadcrumbNav', href: '/developer/design-system/wiki/breadcrumb-nav' },
          { label: 'TagBadge', href: '/developer/design-system/wiki/tag-badge' },
        ],
      },
    ],
  },
  {
    label: 'Question & Q&A',
    items: [
      {
        href: '/developer/design-system/questions',
        label: 'Question & Q&A',
        children: [
          { label: 'QuestionCard', href: '/developer/design-system/questions/question-card' },
          { label: 'AnswerOption', href: '/developer/design-system/questions/answer-option' },
          { label: 'RationalePanel', href: '/developer/design-system/questions/rationale-panel' },
          { label: 'DifficultyBadge', href: '/developer/design-system/questions/difficulty-badge' },
          { label: 'SessionTimer', href: '/developer/design-system/questions/session-timer' },
        ],
      },
    ],
  },
  {
    label: 'Review & Testing Path',
    items: [
      {
        href: '/developer/design-system/testing-path',
        label: 'Review & Testing Path',
        children: [
          { label: 'ReadinessRing', href: '/developer/design-system/testing-path/readiness-ring' },
          { label: 'MasteryBar', href: '/developer/design-system/testing-path/mastery-bar' },
          { label: 'HeatmapGrid', href: '/developer/design-system/testing-path/heatmap-grid' },
          { label: 'TrailProgressCard', href: '/developer/design-system/testing-path/trail-progress-card' },
          { label: 'SubjectPill', href: '/developer/design-system/testing-path/subject-pill' },
        ],
      },
    ],
  },
  {
    label: 'System / Shared',
    items: [
      {
        href: '/developer/design-system/shared',
        label: 'System / Shared',
        children: [
          { label: 'Button', href: '/developer/design-system/shared/button' },
          { label: 'Badge', href: '/developer/design-system/shared/badge' },
          { label: 'Card', href: '/developer/design-system/shared/card' },
          { label: 'Tooltip', href: '/developer/design-system/shared/tooltip' },
          { label: 'Skeleton', href: '/developer/design-system/shared/skeleton' },
          { label: 'EmptyState', href: '/developer/design-system/shared/empty-state' },
        ],
      },
    ],
  },
  {
    label: 'Documentation',
    items: [
      { href: '/developer/api-reference', label: 'API Reference', icon: <BookOpen className="w-3.5 h-3.5" /> },
      { href: '/developer/architecture', label: 'Architecture', icon: <Boxes className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Status',
    items: [
      { href: '/developer/status', label: 'Overview', icon: <Activity className="w-3.5 h-3.5" /> },
      { href: '/developer/status/database', label: 'Database', icon: <Database className="w-3.5 h-3.5" /> },
      { href: '/developer/status/infrastructure', label: 'Infrastructure', icon: <Server className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/developer/tools', label: 'Dev Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/console', label: 'Console', icon: <Monitor className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/db', label: 'Database Browser', icon: <Database className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/logs', label: 'Audit Logs', icon: <ScrollText className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/test-data', label: 'Test Data', icon: <FlaskConical className="w-3.5 h-3.5" /> },
    ],
  },
]

interface DevPortalShellProps {
  env: 'development' | 'staging' | 'production'
  children: React.ReactNode
}

const envBadgeVariant = {
  development: 'success' as const,
  staging: 'warning' as const,
  production: 'danger' as const,
}

export const DevPortalShell = ({ env, children }: DevPortalShellProps) => (
  <PortalLayout
    portalLabel="Developer Portal"
    topbarBg="#0F1F5C"
    accentColor="#1B3FC4"
    accentLightColor="#EEF2FC"
    navItems={devNavItems}
    rightContent={
      <Badge
        variant={envBadgeVariant[env]}
        size="xs"
        pill
        className="font-[family-name:var(--font-dm-mono)]"
      >
        {env}
      </Badge>
    }
    searchComponent={<DevPortalSearch />}
  >
    {children}
  </PortalLayout>
)
