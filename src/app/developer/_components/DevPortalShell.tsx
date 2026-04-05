'use client'

import { Database, Monitor, Flask, BookOpen, SquaresFour, Palette, Pulse, HardDrives, Wrench, Stack, Scroll } from '@phosphor-icons/react/dist/ssr'
import { PortalLayout } from '@/components/portal'
import { Badge } from '@/components/ui/badge'
import { DevPortalSearch } from './DevPortalSearch'
import { PORTALS } from '@/config/portals'
import type { NavGroup } from '@/components/portal'

const devNavItems: NavGroup[] = [
  {
    label: 'Portal',
    items: [
      { href: '/developer', label: 'Overview', icon: <SquaresFour className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Design System',
    items: [
      { href: '/developer/design-system', label: 'Overview', icon: <Palette className="w-3.5 h-3.5" /> },
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
      {
        href: '/developer/design-system/content-blocks',
        label: 'Content Blocks',
        children: [
          { label: 'InlineQuiz', href: '/developer/design-system/content-blocks/inline-quiz' },
          { label: 'FormulaBlock', href: '/developer/design-system/content-blocks/formula-block' },
          { label: 'ExamTip', href: '/developer/design-system/content-blocks/exam-tip' },
          { label: 'ProcessFlow', href: '/developer/design-system/content-blocks/process-flow' },
          { label: 'WikiComparisonTable', href: '/developer/design-system/content-blocks/wiki-comparison-table' },
          { label: 'LawCallout', href: '/developer/design-system/content-blocks/law-callout' },
          { label: 'AlertBox', href: '/developer/design-system/content-blocks/alert-box' },
          { label: 'Accordion', href: '/developer/design-system/content-blocks/accordion' },
          { label: 'TeachBackPrompt', href: '/developer/design-system/content-blocks/teach-back-prompt' },
          { label: 'ElaborativeInterrogation', href: '/developer/design-system/content-blocks/elaborative-interrogation' },
          { label: 'KeyValues', href: '/developer/design-system/content-blocks/key-values' },
        ],
      },
      {
        href: '/developer/design-system/widgets',
        label: 'Interactive Widgets',
        children: [
          { label: 'DoorConfigurator', href: '/developer/design-system/widgets/door-configurator' },
          { label: 'CorridorVisualizer', href: '/developer/design-system/widgets/corridor-visualizer' },
          { label: 'CubicleChecker', href: '/developer/design-system/widgets/cubicle-checker' },
          { label: 'GrabBarExplainer', href: '/developer/design-system/widgets/grab-bar-explainer' },
          { label: 'RecallDrill', href: '/developer/design-system/widgets/recall-drill' },
          { label: 'BP344Comparison', href: '/developer/design-system/widgets/bp344-comparison' },
          { label: 'WorkstationCalculator', href: '/developer/design-system/widgets/workstation-calculator' },
          { label: 'ReachEnvelopeDiagram', href: '/developer/design-system/widgets/reach-envelope-diagram' },
          { label: 'BedroomPlanView', href: '/developer/design-system/widgets/bedroom-plan-view' },
          { label: 'BedSizeComparator', href: '/developer/design-system/widgets/bed-size-comparator' },
          { label: 'BodyDimensionExplorer', href: '/developer/design-system/widgets/body-dimension-explorer' },
          { label: 'DHRatioExplorer', href: '/developer/design-system/widgets/dh-ratio-explorer' },
          { label: 'ProportionComparator', href: '/developer/design-system/widgets/proportion-comparator' },
          { label: 'DimensionDrill', href: '/developer/design-system/widgets/dimension-drill' },
          { label: 'SpatialQualityDrill', href: '/developer/design-system/widgets/spatial-quality-drill' },
          { label: 'BodyDimensionDrill', href: '/developer/design-system/widgets/body-dimension-drill' },
          { label: 'PHBuildingSetbacks', href: '/developer/design-system/widgets/ph-building-setbacks' },
        ],
      },
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
      { href: '/developer/api-reference', label: 'API Reference', icon: <BookOpen className="w-3.5 h-3.5" weight="regular" /> },
      { href: '/developer/architecture', label: 'Architecture', icon: <Stack className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Status',
    items: [
      { href: '/developer/status', label: 'Overview', icon: <Pulse className="w-3.5 h-3.5" /> },
      { href: '/developer/status/database', label: 'Database', icon: <Database className="w-3.5 h-3.5" /> },
      { href: '/developer/status/infrastructure', label: 'Infrastructure', icon: <HardDrives className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/developer/tools', label: 'Dev Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/console', label: 'Console', icon: <Monitor className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/db', label: 'Database Browser', icon: <Database className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/logs', label: 'Audit Logs', icon: <Scroll className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/test-data', label: 'Test Data', icon: <Flask className="w-3.5 h-3.5" /> },
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
    portalLabel={PORTALS.developer.label}
    topbarBg={PORTALS.developer.topbarBg}
    accentColor={PORTALS.developer.accentColor}
    accentLightColor={PORTALS.developer.accentLightColor}
    navItems={devNavItems}
    rightContent={
      <Badge
        variant={envBadgeVariant[env]}
        size="xs"
        shape="pill"
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
