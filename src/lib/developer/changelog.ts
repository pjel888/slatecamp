export interface ChangelogEntry {
  date: string
  title: string
  description: string
  badge?: 'new' | 'update' | 'fix'
  domain?: string
}

export const CHANGELOG: ChangelogEntry[] = [
  { date: '2026-03-25', title: 'Interactive Widgets added to Design System', description: '17 interactive widgets (BP-344, DSGN-013) now documented in the developer hub.', badge: 'new', domain: 'widgets' },
  { date: '2026-03-25', title: 'Content Blocks catalog', description: '11 pedagogical content blocks (InlineQuiz, FormulaBlock, ExamTip, etc.) added.', badge: 'new', domain: 'content-blocks' },
  { date: '2026-03-25', title: 'Sidebar restructured to 5 groups', description: 'Collapsed 10 nav groups into 5 with domain-nested Design System.', badge: 'update' },
  { date: '2026-03-25', title: 'Fuzzy search in command palette', description: 'Fuse.js weighted fuzzy search with character highlighting.', badge: 'update' },
  { date: '2026-03-25', title: 'HeatmapGrid component', description: 'Topic mastery heatmap for the testing path domain.', badge: 'new', domain: 'testing-path' },
  { date: '2026-03-23', title: 'ReadinessRing v2 animation', description: 'CSS-only mount animation with configurable stroke width.', badge: 'update', domain: 'testing-path' },
  { date: '2026-03-21', title: 'Status Dashboard live', description: 'Database health, API latency, and edge function monitoring.', badge: 'new' },
  { date: '2026-03-19', title: 'QuestionCard interactive preview', description: 'Answer selection, difficulty badge, and rationale panel.', badge: 'update', domain: 'questions' },
]
