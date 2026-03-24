import type { ComponentMeta } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  Component Metadata Registry                                        */
/*  Single source of truth for sidebar, search, and page rendering.    */
/* ------------------------------------------------------------------ */

const COMPONENTS: ComponentMeta[] = [
  /* ── Wiki Article ────────────────────────────────────────────────── */
  { slug: 'wiki-card',         title: 'WikiCard',         description: 'Card for wiki article listings with domain tag and status.',                     domain: 'wiki', status: 'stable',     importPath: '@/components/wiki/WikiCard',          filePath: 'src/components/wiki/WikiCard.tsx',          tags: ['card', 'wiki', 'article'] },
  { slug: 'article-renderer',  title: 'ArticleRenderer',  description: 'MDX renderer for wiki articles with heading extraction.',                        domain: 'wiki', status: 'stable',     importPath: '@/components/wiki/ArticleRenderer',   filePath: 'src/components/wiki/ArticleRenderer.tsx',   tags: ['mdx', 'wiki', 'content'] },
  { slug: 'table-of-contents', title: 'TableOfContents',  description: 'Auto-generated table of contents from article headings.',                        domain: 'wiki', status: 'stable',     importPath: '@/components/wiki/TableOfContents',   filePath: 'src/components/wiki/TableOfContents.tsx',   tags: ['navigation', 'wiki', 'toc'] },
  { slug: 'breadcrumb-nav',    title: 'BreadcrumbNav',    description: 'Breadcrumb navigation for wiki article hierarchy.',                              domain: 'wiki', status: 'stable',     importPath: '@/components/wiki/BreadcrumbNav',     filePath: 'src/components/wiki/BreadcrumbNav.tsx',     tags: ['navigation', 'breadcrumb'] },
  { slug: 'tag-badge',         title: 'TagBadge',         description: 'Taxonomy tag pill for categorizing wiki articles.',                              domain: 'wiki', status: 'stable',     importPath: '@/components/wiki/TagBadge',          filePath: 'src/components/wiki/TagBadge.tsx',          tags: ['badge', 'taxonomy', 'tag'] },

  /* ── Question & Q&A ─────────────────────────────────────────────── */
  { slug: 'question-card',     title: 'QuestionCard',     description: 'Displays a quiz question with multiple-choice answer options.',                  domain: 'questions', status: 'stable', importPath: '@/components/shared/question-card',    filePath: 'src/components/shared/question-card.tsx',   tags: ['card', 'quiz', 'question'] },
  { slug: 'answer-option',     title: 'AnswerOption',     description: 'Single answer choice with radio or checkbox selection.',                         domain: 'questions', status: 'stable', importPath: '@/components/questions/AnswerOption',  filePath: 'src/components/questions/AnswerOption.tsx',  tags: ['input', 'quiz', 'answer'] },
  { slug: 'rationale-panel',   title: 'RationalePanel',   description: 'Explanation panel shown after answer submission with citations.',                domain: 'questions', status: 'stable', importPath: '@/components/questions/RationalePanel',filePath: 'src/components/questions/RationalePanel.tsx',tags: ['feedback', 'rationale', 'quiz'] },
  { slug: 'difficulty-badge',  title: 'DifficultyBadge',  description: 'Color-coded difficulty indicator (Easy, Medium, Hard).',                         domain: 'questions', status: 'stable', importPath: '@/components/questions/DifficultyBadge',filePath:'src/components/questions/DifficultyBadge.tsx',tags: ['badge', 'difficulty'] },
  { slug: 'session-timer',     title: 'SessionTimer',     description: 'Countdown timer for timed quiz sessions with auto-submit.',                     domain: 'questions', status: 'beta',   importPath: '@/components/questions/SessionTimer',  filePath: 'src/components/questions/SessionTimer.tsx',  tags: ['timer', 'session', 'quiz'] },

  /* ── Review & Testing Path ──────────────────────────────────────── */
  { slug: 'readiness-ring',    title: 'ReadinessRing',    description: 'Circular progress ring displaying exam readiness score.',                        domain: 'testing-path', status: 'stable', importPath: '@/components/shared/score-display',  filePath: 'src/components/shared/score-display.tsx',  tags: ['progress', 'score', 'ring'] },
  { slug: 'mastery-bar',       title: 'MasteryBar',       description: 'Horizontal progress bar for topic mastery level.',                               domain: 'testing-path', status: 'stable', importPath: '@/components/ui/progress-bar',       filePath: 'src/components/ui/progress-bar.tsx',       tags: ['progress', 'mastery', 'bar'] },
  { slug: 'heatmap-grid',      title: 'HeatmapGrid',      description: 'Topic mastery heatmap as a grid of colored cells.',                              domain: 'testing-path', status: 'beta',   importPath: '@/components/testing/HeatmapGrid',   filePath: 'src/components/testing/HeatmapGrid.tsx',   tags: ['heatmap', 'grid', 'mastery'] },
  { slug: 'trail-progress-card', title: 'TrailProgressCard', description: 'Camp Trail progress summary card with completion percentage.',                domain: 'testing-path', status: 'stable', importPath: '@/components/testing/TrailProgressCard',filePath:'src/components/testing/TrailProgressCard.tsx',tags: ['card', 'trail', 'progress'] },
  { slug: 'subject-pill',      title: 'SubjectPill',      description: 'Subject area tag pill (e.g., "Utilities", "Structural").',                      domain: 'testing-path', status: 'stable', importPath: '@/components/shared/SubjectPill',     filePath: 'src/components/shared/SubjectPill.tsx',     tags: ['badge', 'subject', 'pill'] },

  /* ── System / Shared ────────────────────────────────────────────── */
  { slug: 'button',            title: 'Button',           description: 'Primary action button with multiple variants and sizes.',                        domain: 'shared', status: 'stable',     importPath: '@/components/ui/button',              filePath: 'src/components/ui/button.tsx',              tags: ['button', 'action', 'primitive'] },
  { slug: 'badge',             title: 'Badge',            description: 'Inline status label with color variants.',                                       domain: 'shared', status: 'stable',     importPath: '@/components/ui/badge',               filePath: 'src/components/ui/badge.tsx',               tags: ['badge', 'label', 'status'] },
  { slug: 'card',              title: 'Card',             description: 'Container card with header, content, and action slots.',                         domain: 'shared', status: 'stable',     importPath: '@/components/ui/card',                filePath: 'src/components/ui/card.tsx',                tags: ['card', 'container', 'layout'] },
  { slug: 'tooltip',           title: 'Tooltip',          description: 'Hover tooltip with configurable positioning.',                                   domain: 'shared', status: 'stable',     importPath: '@/components/ui/tooltip',             filePath: 'src/components/ui/tooltip.tsx',             tags: ['tooltip', 'overlay', 'help'] },
  { slug: 'skeleton',          title: 'Skeleton',         description: 'Loading placeholder with shimmer animation.',                                    domain: 'shared', status: 'stable',     importPath: '@/components/ui/skeleton',            filePath: 'src/components/ui/skeleton.tsx',            tags: ['skeleton', 'loading', 'placeholder'] },
  { slug: 'empty-state',       title: 'EmptyState',       description: 'Empty state with icon, message, and call-to-action.',                            domain: 'shared', status: 'stable',     importPath: '@/components/shared/empty-state',     filePath: 'src/components/shared/empty-state.tsx',     tags: ['empty', 'state', 'cta'] },
]

/* ------------------------------------------------------------------ */
/*  Lookup helpers                                                     */
/* ------------------------------------------------------------------ */

export const getComponentBySlug = (
  domain: string,
  slug: string,
): ComponentMeta | null =>
  COMPONENTS.find((c) => c.domain === domain && c.slug === slug) ?? null

export const getComponentsByDomain = (domain: string): ComponentMeta[] =>
  COMPONENTS.filter((c) => c.domain === domain)

export const getAllComponents = (): ComponentMeta[] => [...COMPONENTS]

export const DOMAIN_LABELS: Record<string, string> = {
  wiki: 'Wiki Article',
  questions: 'Question & Q&A',
  'testing-path': 'Review & Testing Path',
  shared: 'System / Shared',
}
