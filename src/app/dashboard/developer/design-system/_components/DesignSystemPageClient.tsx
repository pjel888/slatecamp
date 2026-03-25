'use client'

import { useState } from 'react'
import {
  Bookmark,
  Search,
  Plus,
  ArrowRight,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  FolderTree,
  FileText,
  BarChart3,
  Clock,
  TrendingUp,
  Settings,
  BookOpen,
  Target,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  List,
  Home,
  Database,
  Palette,
  GripVertical,
  User,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CloseButton } from '@/components/ui/close-button'
import { Badge } from '@/components/ui/badge'
import { LegalCitationBadge } from '@/components/shared/legal-citation-badge'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from '@/components/ui/card'
import { SectionHeader } from '@/components/shared/section-header'
import { EmptyState } from '@/components/shared/empty-state'
import {
  Skeleton,
  CardSkeleton,
  TableRowSkeleton,
  StatCardSkeleton,
  ArticleListSkeleton,
  QuestionCardSkeleton,
  ScoreRingSkeleton,
} from '@/components/ui/skeleton'
import { ScoreDisplay } from '@/components/shared/score-display'
import { StatCard } from '@/components/shared/stat-card'
import { Input, SearchInput } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Breadcrumb } from '@/components/shared/breadcrumb'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  ConfirmDialog,
} from '@/components/ui/dialog'
import { QuestionCard } from '@/components/shared/question-card'
import { DataTable } from '@/components/shared/data-table'
import { TaxonomyPicker } from '@/components/shared/taxonomy-picker'
import { TaxonomyTree } from '@/components/shared/taxonomy-tree'
import { toast } from '@/lib/hooks/use-toast'
import { ProgressBar } from '@/components/ui/progress-bar'
import { FormField } from '@/components/ui/form-field'
import { ModeButton } from '@/components/ui/mode-button'
import { IconButton } from '@/components/ui/icon-button'
import { Toolbar, ToolbarGroup, ToolbarDivider } from '@/components/ui/toolbar'
import { ActionCard } from '@/components/shared/action-card'
import { QuestionDotNavigator } from '@/components/shared/question-dot-navigator'
import type { QuestionDot } from '@/components/shared/question-dot-navigator'
import { PageHeader } from '@/components/shared/page-header'
import { FloatingPanel } from '@/components/shared/floating-panel'
import { AppDrawer } from '@/components/shared/app-drawer'
import { SidebarNavGroup, SidebarNavItem, SidebarNavDivider } from '@/components/shared/sidebar-nav'
import {
  ContentSidebar,
  ContentSidebarSection,
  ContentSidebarTocLink,
  ContentSidebarFeedback,
  ContentSidebarSources,
  ContentSidebarPopover,
} from '@/components/shared/content-sidebar'
import { Callout, Note, Warn, Tip, Example, CalloutBox } from '@/components/wiki/Callout'
import { Accordion, AccordionItem } from '@/components/wiki/Accordion'

/* ------------------------------------------------------------------ */
/*  Sample data                                                        */
/* ------------------------------------------------------------------ */

const sampleQuestionOptions = [
  { id: 'a', label: 'A', text: 'The minimum clear width of a corridor in a residential building is 1.10 meters.', isCorrect: false },
  { id: 'b', label: 'B', text: 'The minimum clear width of a corridor in a residential building is 1.20 meters.', isCorrect: true },
  { id: 'c', label: 'C', text: 'The minimum clear width of a corridor in a residential building is 1.00 meters.', isCorrect: false },
  { id: 'd', label: 'D', text: 'The minimum clear width of a corridor in a residential building is 0.90 meters.', isCorrect: false },
]

const sampleTableData = [
  { id: '1', title: 'Fire Safety Requirements', topic: 'Fire Code', difficulty: 'Hard', status: 'Published', updated: '2026-03-20' },
  { id: '2', title: 'Accessibility Standards', topic: 'BP 344', difficulty: 'Medium', status: 'Published', updated: '2026-03-18' },
  { id: '3', title: 'Structural Load Calculations', topic: 'NSCP', difficulty: 'Hard', status: 'Draft', updated: '2026-03-15' },
  { id: '4', title: 'Building Permits Process', topic: 'PD 1096', difficulty: 'Easy', status: 'Published', updated: '2026-03-12' },
  { id: '5', title: 'Zoning Regulations', topic: 'BP 220', difficulty: 'Medium', status: 'Draft', updated: '2026-03-10' },
]

const sampleTaxonomyNodes = [
  {
    node_id: 'arch',
    name: 'Architecture',
    level: 0,
    ale_id: 'ARC',
    article_count: 24,
    question_count: 180,
    children: [
      {
        node_id: 'arch-design',
        name: 'Design & Planning',
        level: 1,
        parent_id: 'arch',
        ale_id: 'ARC-DP',
        article_count: 8,
        question_count: 62,
        children: [
          { node_id: 'arch-design-site', name: 'Site Planning', level: 2, parent_id: 'arch-design', ale_id: 'ARC-DP-01', article_count: 3, question_count: 18 },
          { node_id: 'arch-design-prog', name: 'Programming', level: 2, parent_id: 'arch-design', ale_id: 'ARC-DP-02', article_count: 5, question_count: 22 },
        ],
      },
      {
        node_id: 'arch-codes',
        name: 'Building Codes',
        level: 1,
        parent_id: 'arch',
        ale_id: 'ARC-BC',
        article_count: 16,
        question_count: 118,
        children: [
          { node_id: 'arch-codes-nbcp', name: 'NBCP (PD 1096)', level: 2, parent_id: 'arch-codes', ale_id: 'ARC-BC-01', article_count: 10, question_count: 74 },
          { node_id: 'arch-codes-fire', name: 'Fire Code (RA 9514)', level: 2, parent_id: 'arch-codes', ale_id: 'ARC-BC-02', article_count: 6, question_count: 44 },
        ],
      },
    ],
  },
  {
    node_id: 'struct',
    name: 'Structures',
    level: 0,
    ale_id: 'STR',
    article_count: 12,
    question_count: 95,
    children: [
      { node_id: 'struct-loads', name: 'Loads & Forces', level: 1, parent_id: 'struct', ale_id: 'STR-LF', article_count: 6, question_count: 48 },
      { node_id: 'struct-mats', name: 'Materials', level: 1, parent_id: 'struct', ale_id: 'STR-MT', article_count: 6, question_count: 47 },
    ],
  },
]

const sampleTreeNodes = [
  {
    node_id: 'hist',
    name: 'History of Architecture',
    slug: 'history-of-architecture',
    level: 1,
    ale_id: 'ALE-HIST',
    article_count: 55,
    question_count: 420,
    children: [
      {
        node_id: 'hist-ancient',
        name: 'Pre-Historic & Ancient',
        slug: 'pre-historic-ancient',
        level: 2,
        parent_id: 'hist',
        ale_id: 'ALE-HIST-001',
        article_count: 7,
        children: [
          { node_id: 'hist-ancient-mega', name: 'Megalithic Architecture', slug: 'megalithic-architecture', level: 3, parent_id: 'hist-ancient', ale_id: 'ALE-HIST-001-01', is_leaf: true, articles: [{ article_id: 'a1', title: 'Megalithic Architecture', slug: 'megalithic-architecture' }] },
          { node_id: 'hist-ancient-meso', name: 'Mesopotamian Architecture', slug: 'mesopotamian-architecture', level: 3, parent_id: 'hist-ancient', ale_id: 'ALE-HIST-001-02', is_leaf: true, articles: [{ article_id: 'a2', title: 'Mesopotamian Architecture', slug: 'mesopotamian-architecture' }] },
          { node_id: 'hist-ancient-egypt', name: 'Egyptian Architecture', slug: 'egyptian-architecture', level: 3, parent_id: 'hist-ancient', ale_id: 'ALE-HIST-001-03', is_leaf: true, articles: [{ article_id: 'a3', title: 'Egyptian Architecture', slug: 'egyptian-architecture' }] },
          { node_id: 'hist-ancient-greek', name: 'Greek Architecture', slug: 'greek-architecture', level: 3, parent_id: 'hist-ancient', ale_id: 'ALE-HIST-001-05', is_leaf: true, articles: [{ article_id: 'a5', title: 'Greek Architecture', slug: 'greek-architecture' }] },
          { node_id: 'hist-ancient-roman', name: 'Roman Architecture', slug: 'roman-architecture', level: 3, parent_id: 'hist-ancient', ale_id: 'ALE-HIST-001-06', is_leaf: true, articles: [{ article_id: 'a6', title: 'Roman Architecture', slug: 'roman-architecture' }] },
        ],
      },
      {
        node_id: 'hist-medieval',
        name: 'Medieval Architecture',
        slug: 'medieval-architecture',
        level: 2,
        parent_id: 'hist',
        ale_id: 'ALE-HIST-002',
        article_count: 6,
        children: [
          { node_id: 'hist-medieval-byz', name: 'Byzantine Architecture', slug: 'byzantine-architecture', level: 3, parent_id: 'hist-medieval', ale_id: 'ALE-HIST-002-01', is_leaf: true, articles: [{ article_id: 'a7', title: 'Byzantine Architecture', slug: 'byzantine-architecture' }] },
          { node_id: 'hist-medieval-goth', name: 'Gothic Architecture', slug: 'gothic-architecture', level: 3, parent_id: 'hist-medieval', ale_id: 'ALE-HIST-002-02', is_leaf: true, articles: [{ article_id: 'a8', title: 'Gothic Architecture', slug: 'gothic-architecture' }] },
        ],
      },
    ],
  },
  {
    node_id: 'btech',
    name: 'Building Technology',
    slug: 'building-technology',
    level: 1,
    ale_id: 'ALE-BTECH',
    article_count: 32,
    question_count: 260,
    children: [
      { node_id: 'btech-mats', name: 'Construction Materials', slug: 'construction-materials', level: 2, parent_id: 'btech', ale_id: 'ALE-BTECH-001', article_count: 14, question_count: 110 },
      { node_id: 'btech-methods', name: 'Construction Methods', slug: 'construction-methods', level: 2, parent_id: 'btech', ale_id: 'ALE-BTECH-002', article_count: 18, question_count: 150 },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Color Palette Data                                                 */
/* ------------------------------------------------------------------ */

const campfireColors = [
  { name: 'Camp Cobalt', hex: '#1B3FC4', class: 'bg-camp-cobalt', usage: 'Primary actions, nav, links' },
  { name: 'Camp Cobalt 50', hex: '#EEF2FC', class: 'bg-[#EEF2FC]', usage: 'Active backgrounds, tints' },
  { name: 'Camp Cobalt 700', hex: '#1535A8', class: 'bg-[#1535A8]', usage: 'Hover/pressed states' },
  { name: 'Camp Orange', hex: '#E8853A', class: 'bg-camp-orange', usage: 'Progress, warm CTAs' },
  { name: 'Emerald', hex: '#2D9F6F', class: 'bg-emerald', usage: 'Success, mastery, correct' },
  { name: 'Emerald 50', hex: '#EDFAF4', class: 'bg-[#EDFAF4]', usage: 'Success backgrounds' },
  { name: 'Warm Red', hex: '#D64545', class: 'bg-destructive', usage: 'Error, critical' },
  { name: 'Warm Red 50', hex: '#FDF0F0', class: 'bg-[#FDF0F0]', usage: 'Error backgrounds' },
  { name: 'Amber', hex: '#D4951A', class: 'bg-warning', usage: 'Warning, developing skill' },
  { name: 'Amber 50', hex: '#FEF8ED', class: 'bg-[#FEF8ED]', usage: 'Warning backgrounds' },
  { name: 'Info Blue', hex: '#3B82C8', class: 'bg-[#3B82C8]', usage: 'Informational callouts' },
  { name: 'Surface Light', hex: '#F8F7F5', class: 'bg-[#F8F7F5]', usage: 'Page background' },
  { name: 'Surface Card', hex: '#FFFFFF', class: 'bg-[#FFFFFF] border border-border', usage: 'Card backgrounds' },
  { name: 'Ink Primary', hex: '#1A2332', class: 'bg-text-primary', usage: 'Main text' },
  { name: 'Ink Secondary', hex: '#4A5568', class: 'bg-text-secondary', usage: 'Supporting text' },
  { name: 'Ink Tertiary', hex: '#8896A7', class: 'bg-text-tertiary', usage: 'Muted text, placeholders' },
  { name: 'Border Default', hex: '#D4DAE3', class: 'bg-border', usage: 'Borders, dividers' },
]

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */

const Section = ({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  children: React.ReactNode
}) => (
  <section className="space-y-4">
    <SectionHeader
      level="section"
      eyebrow={eyebrow}
      title={title}
      subtitle={subtitle}
    />
    {children}
  </section>
)

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const DesignSystemPage = () => {
  // Interactive state for demos
  const [quizSelected, setQuizSelected] = useState<string | null>(null)
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [tableSelection, setTableSelection] = useState<Set<string>>(new Set())
  const [taxonomyValue, setTaxonomyValue] = useState<string | string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [activeModeButton, setActiveModeButton] = useState<string | null>(null)
  const [floatingPanelOpen, setFloatingPanelOpen] = useState(false)
  const [floatingPanelDraggableOpen, setFloatingPanelDraggableOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-20">
      {/* ============================================================ */}
      {/*  1. Page Header                                               */}
      {/* ============================================================ */}
      <SectionHeader
        level="page"
        eyebrow="COMPONENT LIBRARY"
        title="Design System"
        subtitle="Living reference for every canonical component in the SlateCamp Campfire design system."
      />

      {/* ============================================================ */}
      {/*  2. Colors                                                    */}
      {/* ============================================================ */}
      <Section
        eyebrow="FOUNDATIONS"
        title="Color Palette"
        subtitle="The Campfire palette. Warm, inviting, and research-backed."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {campfireColors.map((c) => (
            <div key={c.name} className="text-center">
              <div className={`h-12 w-full rounded-md ${c.class}`} />
              <p className="mt-1.5 text-[11px] font-medium text-foreground">
                {c.name}
              </p>
              <p className="font-mono text-[11px] text-muted-foreground">
                {c.hex}
              </p>
              <p className="text-[11px] text-muted-foreground">{c.usage}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  3. Typography                                                */}
      {/* ============================================================ */}
      <Section
        eyebrow="FOUNDATIONS"
        title="Typography"
        subtitle="Inter (body), DM Mono (data/labels), Syne (display headings). Minimum text size: 11px."
      >
        <Card variant="default" size="md">
          <CardContent className="space-y-3">
            <p className="font-[family-name:var(--font-display)] text-2xl font-extrabold tracking-tight text-foreground">
              Display Heading (Syne, 24px extrabold)
            </p>
            <p className="text-xl font-bold text-foreground">
              Heading XL (Inter, 20px bold)
            </p>
            <p className="text-lg font-bold text-foreground">
              Heading LG (Inter, 18px bold)
            </p>
            <p className="text-base font-medium text-foreground">
              Heading Base (Inter, 16px medium)
            </p>
            <p className="text-sm font-semibold text-foreground">
              Heading SM (Inter, 14px semibold)
            </p>
            <p className="text-sm text-foreground">
              Body text (Inter, 14px regular) -- The standard for all reading content.
            </p>
            <p className="text-xs text-muted-foreground">
              Caption (Inter, 12px muted)
            </p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Label (Inter, 11px uppercase tracking)
            </p>
            <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              Mono Label (DM Mono, 11px uppercase)
            </p>
            <p className="font-mono text-sm tabular-nums text-foreground">
              Monospace data: 85.2% | 1,247 | 03:42
            </p>
          </CardContent>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/*  4. Buttons                                                   */}
      {/* ============================================================ */}
      <Section
        eyebrow="ACTIONS"
        title="Buttons"
        subtitle="All variant and size combinations. Includes icon, loading, disabled, and full-width demos."
      >
        {/* Variants */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Variants</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Button variant="success">Success</Button>
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Sizes</p>
          <div className="flex flex-wrap items-end gap-2">
            <Button size="xs">Extra Small</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </div>

        {/* Icons */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">With Icons</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button leftIcon={<Plus />}>Add Question</Button>
            <Button rightIcon={<ArrowRight />}>Continue</Button>
            <Button variant="destructive" leftIcon={<Trash2 />}>Delete</Button>
            <Button variant="secondary" leftIcon={<Search />}>Search Topics</Button>
            <Button variant="success" leftIcon={<CheckCircle2 />}>Mark Complete</Button>
          </div>
        </div>

        {/* States */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">States</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button loading>Saving...</Button>
            <Button disabled>Disabled</Button>
            <Button variant="secondary" loading>Loading</Button>
            <Button variant="destructive" disabled>Disabled</Button>
          </div>
        </div>

        {/* Full width */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Full Width</p>
          <div className="max-w-sm">
            <Button fullWidth leftIcon={<ArrowRight />}>
              Start 10-Question Review
            </Button>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  5. Close Buttons                                             */}
      {/* ============================================================ */}
      <Section
        eyebrow="ACTIONS"
        title="Close Buttons"
        subtitle="Dismissal affordance. Three variants across three sizes."
      >
        <div className="space-y-3">
          {(['ghost', 'subtle', 'destructive'] as const).map((variant) => (
            <div key={variant} className="flex items-center gap-4">
              <span className="w-24 text-xs font-medium text-muted-foreground capitalize">
                {variant}
              </span>
              <CloseButton variant={variant} size="sm" />
              <CloseButton variant={variant} size="md" />
              <CloseButton variant={variant} size="lg" />
            </div>
          ))}
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  6. Badges                                                    */}
      {/* ============================================================ */}
      <Section
        eyebrow="DATA DISPLAY"
        title="Badges"
        subtitle="Color variants for categorization and status indication."
      >
        {/* Badge color variants */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Color Variants</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="ghost">Ghost</Badge>
            <Badge variant="link">Link</Badge>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  7. Legal Citations                                           */}
      {/* ============================================================ */}
      <Section
        eyebrow="DOMAIN-SPECIFIC"
        title="Legal Citation Badges"
        subtitle="All 7 Philippine legal codes used throughout SlateCamp content."
      >
        <div className="flex flex-wrap items-center gap-3">
          <LegalCitationBadge code="PD 1096" />
          <LegalCitationBadge code="RA 9514" />
          <LegalCitationBadge code="BP 344" />
          <LegalCitationBadge code="RA 9266" />
          <LegalCitationBadge code="NSCP" />
          <LegalCitationBadge code="BP 220" />
          <LegalCitationBadge code="PD 957" />
        </div>
        <p className="text-xs text-muted-foreground">
          With href prop, badges render as anchor links with hover underline.
        </p>
      </Section>

      {/* ============================================================ */}
      {/*  8. Cards                                                     */}
      {/* ============================================================ */}
      <Section
        eyebrow="LAYOUT"
        title="Cards"
        subtitle="Container variants for grouping related content."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Default */}
          <Card variant="default" size="md">
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard container with border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Used for general content grouping throughout the application.
              </p>
            </CardContent>
          </Card>

          {/* Interactive */}
          <Card variant="interactive" size="md">
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Hover to see the effect</CardDescription>
              <CardAction>
                <Button variant="ghost" size="xs">View</Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Includes hover border highlight and shadow. Used for clickable items.
              </p>
            </CardContent>
          </Card>

          {/* Selected */}
          <Card variant="selected" size="md">
            <CardHeader>
              <CardTitle>Selected Card</CardTitle>
              <CardDescription>Active/selected state</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Primary border with tinted background. Used for active selections.
              </p>
            </CardContent>
          </Card>

          {/* Accent-left */}
          <Card variant="accent-left" size="md" className="border-l-primary">
            <CardHeader>
              <CardTitle>Accent Left Card</CardTitle>
              <CardDescription>Left border accent</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Thick left border for visual emphasis. Pair with color for category coding.
              </p>
            </CardContent>
          </Card>

          {/* Ghost */}
          <Card variant="ghost" size="md">
            <CardHeader>
              <CardTitle>Ghost Card</CardTitle>
              <CardDescription>No background or border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Transparent container. Used when card semantics are needed without visual weight.
              </p>
            </CardContent>
          </Card>

          {/* Size: sm */}
          <Card variant="default" size="sm">
            <CardHeader>
              <CardTitle>Small Card (size=sm)</CardTitle>
              <CardDescription>Compact padding variant</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Tighter spacing for dense layouts like sidebars or lists.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  9. Section Headers                                           */}
      {/* ============================================================ */}
      <Section
        eyebrow="LAYOUT"
        title="Section Headers"
        subtitle="Three hierarchy levels: page, section, and card."
      >
        <Card variant="default" size="lg">
          <CardContent className="space-y-8">
            <SectionHeader
              level="page"
              eyebrow="COURSE OVERVIEW"
              title="Architecture Licensure"
              subtitle="Your study dashboard for the ALE board exam."
              action={<Button size="sm">Start Review</Button>}
            />
            <div className="border-t border-border pt-6">
              <SectionHeader
                level="section"
                eyebrow="STUDY PROGRESS"
                title="Building Codes & Regulations"
                subtitle="12 of 24 topics reviewed this week."
                action={<Button variant="ghost" size="xs">View All</Button>}
              />
            </div>
            <div className="border-t border-border pt-6">
              <SectionHeader
                level="card"
                eyebrow="MASTERY"
                title="Fire Code Fundamentals"
                subtitle="Last reviewed 2 days ago"
              />
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/*  10. Score Display                                            */}
      {/* ============================================================ */}
      <Section
        eyebrow="DATA DISPLAY"
        title="Score Display"
        subtitle="Four variants (ring, bar, pill, number) across sizes and score levels."
      >
        {/* Ring */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Ring Variant</p>
          <div className="flex flex-wrap items-end gap-6">
            <ScoreDisplay value={85} variant="ring" size="sm" label="SM" />
            <ScoreDisplay value={85} variant="ring" size="md" label="MD" />
            <ScoreDisplay value={55} variant="ring" size="lg" label="LG (55%)" />
            <ScoreDisplay value={25} variant="ring" size="xl" label="XL (25%)" />
          </div>
        </div>

        {/* Bar */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Bar Variant</p>
          <div className="max-w-md space-y-2">
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-muted-foreground">85%</span>
              <ScoreDisplay value={85} variant="bar" size="md" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-muted-foreground">55%</span>
              <ScoreDisplay value={55} variant="bar" size="md" />
            </div>
            <div className="flex items-center gap-3">
              <span className="w-16 text-xs text-muted-foreground">25%</span>
              <ScoreDisplay value={25} variant="bar" size="md" />
            </div>
          </div>
        </div>

        {/* Pill and Number */}
        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Pill Variant</p>
            <div className="flex items-center gap-2">
              <ScoreDisplay value={85} variant="pill" />
              <ScoreDisplay value={55} variant="pill" />
              <ScoreDisplay value={25} variant="pill" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Number Variant</p>
            <div className="flex items-center gap-4">
              <ScoreDisplay value={85} variant="number" size="sm" />
              <ScoreDisplay value={55} variant="number" size="md" />
              <ScoreDisplay value={25} variant="number" size="lg" />
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  11. Stat Cards                                               */}
      {/* ============================================================ */}
      <Section
        eyebrow="DATA DISPLAY"
        title="Stat Cards"
        subtitle="Key metrics with trend indicators."
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            eyebrow="Readiness Score"
            value="78%"
            trend={{ direction: 'up', label: '+5% this week' }}
          />
          <StatCard
            eyebrow="Questions Practiced"
            value="1,247"
            trend={{ direction: 'up', label: '+124 today' }}
          />
          <StatCard
            eyebrow="Topics Covered"
            value="42"
            trend={{ direction: 'flat', label: 'No change' }}
          />
          <StatCard
            eyebrow="Study Streak"
            value="12 days"
            trend={{ direction: 'down', label: 'Missed yesterday' }}
          />
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  12. Form Inputs                                              */}
      {/* ============================================================ */}
      <Section
        eyebrow="FORMS"
        title="Form Inputs"
        subtitle="Text inputs and search inputs with size and state variants."
      >
        {/* Sizes */}
        <div className="max-w-md space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Sizes</p>
          <Input size="sm" placeholder="Small input (sm)" />
          <Input size="md" placeholder="Medium input (md) -- default" />
          <Input size="lg" placeholder="Large input (lg)" />
        </div>

        {/* States */}
        <div className="max-w-md space-y-3">
          <p className="text-xs font-medium text-muted-foreground">States</p>
          <Input placeholder="Default state" />
          <Input placeholder="Disabled state" disabled />
          <Input placeholder="Error state" aria-invalid="true" />
        </div>

        {/* Search Input */}
        <div className="max-w-md space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Search Input</p>
          <SearchInput
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Search topics..."
            shortcutHint="/"
          />
          <SearchInput
            placeholder="Loading search..."
            loading
          />
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  13. Tabs                                                     */}
      {/* ============================================================ */}
      <Section
        eyebrow="NAVIGATION"
        title="Tabs"
        subtitle="Three style variants: underline, pill, and segmented."
      >
        <div className="space-y-6">
          {/* Underline */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Underline (default)</p>
            <Tabs defaultValue="overview">
              <TabsList variant="underline">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="questions">Questions</TabsTrigger>
                <TabsTrigger value="articles">Articles</TabsTrigger>
              </TabsList>
              <TabsContent value="overview">
                <p className="py-3 text-sm text-muted-foreground">Overview tab content.</p>
              </TabsContent>
              <TabsContent value="questions">
                <p className="py-3 text-sm text-muted-foreground">Questions tab content.</p>
              </TabsContent>
              <TabsContent value="articles">
                <p className="py-3 text-sm text-muted-foreground">Articles tab content.</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Pill */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Pill</p>
            <Tabs defaultValue="all">
              <TabsList variant="pill">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <p className="py-3 text-sm text-muted-foreground">All items.</p>
              </TabsContent>
              <TabsContent value="active">
                <p className="py-3 text-sm text-muted-foreground">Active items.</p>
              </TabsContent>
              <TabsContent value="completed">
                <p className="py-3 text-sm text-muted-foreground">Completed items.</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Segmented */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Segmented</p>
            <Tabs defaultValue="week">
              <TabsList variant="segmented">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
              <TabsContent value="day">
                <p className="py-3 text-sm text-muted-foreground">Daily view.</p>
              </TabsContent>
              <TabsContent value="week">
                <p className="py-3 text-sm text-muted-foreground">Weekly view.</p>
              </TabsContent>
              <TabsContent value="month">
                <p className="py-3 text-sm text-muted-foreground">Monthly view.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  14. Breadcrumb                                               */}
      {/* ============================================================ */}
      <Section
        eyebrow="NAVIGATION"
        title="Breadcrumb"
        subtitle="Short paths and auto-truncated deep paths."
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Short path</p>
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '#' },
                { label: 'Building Codes', href: '#' },
                { label: 'Fire Safety' },
              ]}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Truncated deep path (auto-ellipsis beyond 4 items)</p>
            <Breadcrumb
              items={[
                { label: 'Dashboard', href: '#' },
                { label: 'Study Plan', href: '#' },
                { label: 'Architecture', href: '#' },
                { label: 'Building Codes', href: '#' },
                { label: 'PD 1096', href: '#' },
                { label: 'Chapter 7: Fire Zones' },
              ]}
            />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Slash separator</p>
            <Breadcrumb
              separator="slash"
              items={[
                { label: 'Wiki', href: '#' },
                { label: 'Structural Analysis', href: '#' },
                { label: 'Load Combinations' },
              ]}
            />
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  15. Empty States                                             */}
      {/* ============================================================ */}
      <Section
        eyebrow="FEEDBACK"
        title="Empty States"
        subtitle="Welcoming, non-accusatory placeholders for empty content areas."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Card variant="default" size="md">
            <EmptyState
              icon={<FileText className="h-5 w-5" />}
              message="No articles yet"
              description="Start building your knowledge base by creating your first wiki article."
              action={{ label: 'Create Article', onClick: () => {} }}
            />
          </Card>
          <Card variant="default" size="md">
            <EmptyState
              icon={<BarChart3 className="h-5 w-5" />}
              message="No study data available"
              description="Complete a practice session to see your performance analytics here."
            />
          </Card>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  16. Skeletons                                                */}
      {/* ============================================================ */}
      <Section
        eyebrow="FEEDBACK"
        title="Skeletons"
        subtitle="Loading placeholders that mirror the shape of real content."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Card Skeleton</p>
            <CardSkeleton />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Stat Card Skeleton</p>
            <StatCardSkeleton />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Question Card Skeleton</p>
            <QuestionCardSkeleton />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Article List Skeleton</p>
            <ArticleListSkeleton rows={3} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Table Row Skeletons</p>
          <div className="rounded-lg border border-border overflow-hidden">
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Score Ring Skeletons</p>
          <div className="flex items-end gap-4">
            <ScoreRingSkeleton size="sm" />
            <ScoreRingSkeleton size="md" />
            <ScoreRingSkeleton size="lg" />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Primitive Skeletons</p>
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  17. Question Card                                            */}
      {/* ============================================================ */}
      <Section
        eyebrow="DOMAIN-SPECIFIC"
        title="Question Card"
        subtitle="Quiz and review variants with interactive answer selection."
      >
        <div className="space-y-6">
          {/* Quiz variant */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">Quiz Variant (interactive)</p>
              <div className="flex gap-2">
                {quizSubmitted && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => { setQuizSubmitted(false); setQuizSelected(null) }}
                  >
                    Reset
                  </Button>
                )}
                {!quizSubmitted && quizSelected && (
                  <Button size="xs" onClick={() => setQuizSubmitted(true)}>
                    Submit Answer
                  </Button>
                )}
              </div>
            </div>
            <QuestionCard
              variant="quiz"
              stem="According to the National Building Code of the Philippines (PD 1096), what is the minimum clear width of a corridor serving as a means of egress in a residential building?"
              options={sampleQuestionOptions}
              selectedOptionId={quizSelected}
              onSelectOption={setQuizSelected}
              submitted={quizSubmitted}
              questionNumber={7}
              totalQuestions={25}
              flagged={false}
              onFlag={() => {}}
            />
          </div>

          {/* Review variant */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Review Variant (post-submission)</p>
            <QuestionCard
              variant="review"
              stem="According to the National Building Code of the Philippines (PD 1096), what is the minimum clear width of a corridor serving as a means of egress in a residential building?"
              options={sampleQuestionOptions}
              userAnswerId="a"
              correctAnswerId="b"
              rationale="<p>Per <strong>PD 1096, Rule VII, Section 707</strong>, the minimum corridor width for a residential building used as a means of egress is <strong>1.20 meters</strong>. The 1.10m dimension applies to non-egress corridors in certain occupancy types.</p>"
              questionNumber={7}
            />
          </div>

          {/* Compact variant */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Compact Variant (list item)</p>
            <QuestionCard
              variant="compact"
              stem="According to the National Building Code of the Philippines (PD 1096), what is the minimum clear width of a corridor serving as a means of egress in a residential building?"
              options={sampleQuestionOptions}
              questionNumber={7}
              metadata={{ difficulty: 'Medium', status: 'Published' }}
            />
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  18. Data Table                                               */}
      {/* ============================================================ */}
      <Section
        eyebrow="DATA DISPLAY"
        title="Data Table"
        subtitle="Sortable, selectable table with search and pagination."
      >
        <DataTable
          columns={[
            { key: 'title', header: 'Title', sortable: true },
            { key: 'topic', header: 'Topic', sortable: true },
            { key: 'difficulty', header: 'Difficulty', sortable: true },
            { key: 'status', header: 'Status', sortable: true },
            { key: 'updated', header: 'Updated', type: 'date', sortable: true },
          ]}
          data={sampleTableData}
          keyField="id"
          searchable
          searchPlaceholder="Search questions..."
          searchFields={['title', 'topic']}
          selectable
          selectedKeys={tableSelection}
          onSelectionChange={setTableSelection}
          defaultSort={{ key: 'updated', direction: 'desc' }}
          pageSize={10}
          emptyMessage="No questions match your search."
        />
      </Section>

      {/* ============================================================ */}
      {/*  19. Taxonomy Picker                                          */}
      {/* ============================================================ */}
      <Section
        eyebrow="DOMAIN-SPECIFIC"
        title="Taxonomy Picker (3-Level Tree)"
        subtitle="One component, three variants: dropdown (forms), sidebar (wiki), inline (admin). Supports search, expand/collapse, single/multi select."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Dropdown variant */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Dropdown (forms)</p>
            <div className="max-w-xs">
              <TaxonomyPicker
                variant="dropdown"
                mode="single"
                nodes={sampleTaxonomyNodes}
                value={typeof taxonomyValue === 'string' ? taxonomyValue : ''}
                onChange={(v) => setTaxonomyValue(v)}
                showCounts
                showAleId
                placeholder="Select topic..."
              />
            </div>
          </div>

          {/* Sidebar variant */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Sidebar (wiki nav)</p>
            <TaxonomyPicker
              variant="sidebar"
              mode="single"
              nodes={sampleTaxonomyNodes}
              value={typeof taxonomyValue === 'string' ? taxonomyValue : ''}
              onChange={(v) => setTaxonomyValue(v)}
              showCounts
              showAleId
              className="max-h-64"
            />
          </div>
        </div>

        {/* Inline variant - multi select */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Inline (admin, multi-select)</p>
          <Card variant="default" size="md">
            <CardContent>
              <TaxonomyPicker
                variant="inline"
                mode="multi"
                nodes={sampleTaxonomyNodes}
                value={Array.isArray(taxonomyValue) ? taxonomyValue : []}
                onChange={(v) => setTaxonomyValue(v)}
                showCounts
                showAleId
                className="max-h-72"
              />
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  19b. Taxonomy Tree (Navigation)                              */}
      {/* ============================================================ */}
      <Section
        eyebrow="DOMAIN-SPECIFIC"
        title="Taxonomy Tree (Navigation)"
        subtitle="Read-only navigation tree for wiki sidebar. Shows hierarchy with articles, counts right-aligned in DM Mono, and vertical indent lines on expand."
      >
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">With counts</p>
            <Card variant="default" size="sm" className="overflow-hidden">
              <TaxonomyTree
                nodes={sampleTreeNodes}
                activeSlug="roman-architecture"
                showCounts
                basePath="#"
                className="max-h-80"
              />
            </Card>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">With ALE IDs (no counts)</p>
            <Card variant="default" size="sm" className="overflow-hidden">
              <TaxonomyTree
                nodes={sampleTreeNodes}
                showCounts={false}
                basePath="#"
                className="max-h-80"
              />
            </Card>
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  20. Toasts                                                   */}
      {/* ============================================================ */}
      <Section
        eyebrow="FEEDBACK"
        title="Toasts"
        subtitle="Non-blocking notifications. Click to trigger each variant."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toast({ title: 'Default toast', description: 'This is a standard notification.' })
            }
          >
            Default
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<CheckCircle2 className="text-emerald-500" />}
            onClick={() =>
              toast({
                variant: 'success' as never,
                title: 'Session saved',
                description: 'Your progress has been saved.',
              })
            }
          >
            Success
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<AlertTriangle className="text-amber-500" />}
            onClick={() =>
              toast({
                variant: 'warning' as never,
                title: 'Session expiring',
                description: 'Your study session will end in 5 minutes.',
              })
            }
          >
            Warning
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<X className="text-destructive" />}
            onClick={() =>
              toast({
                variant: 'error' as never,
                title: 'Save failed',
                description: 'Could not save your answer. Please try again.',
              })
            }
          >
            Error
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Info className="text-blue-500" />}
            onClick={() =>
              toast({
                variant: 'info' as never,
                title: 'Did you know?',
                description: 'You can flag questions for later review.',
              })
            }
          >
            Info
          </Button>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  21. Dialog                                                   */}
      {/* ============================================================ */}
      <Section
        eyebrow="OVERLAYS"
        title="Dialog"
        subtitle="Modal dialogs for focused tasks and confirmations."
      >
        <div className="flex flex-wrap gap-2">
          {/* Standard Dialog */}
          <Dialog>
            <DialogTrigger render={<Button variant="secondary" size="sm" />}>
              Open Dialog
            </DialogTrigger>
            <DialogContent size="md">
              <DialogHeader>
                <DialogTitle>Edit Study Plan</DialogTitle>
                <DialogDescription>
                  Make changes to your study plan here. Click save when you are done.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Input placeholder="Plan name" defaultValue="ALE Board Exam Prep" />
                <Input placeholder="Target date" defaultValue="2026-06-15" />
              </div>
            </DialogContent>
          </Dialog>

          {/* Small Dialog */}
          <Dialog>
            <DialogTrigger render={<Button variant="secondary" size="sm" />}>
              Small Dialog
            </DialogTrigger>
            <DialogContent size="sm">
              <DialogHeader>
                <DialogTitle>Quick Note</DialogTitle>
                <DialogDescription>
                  A compact dialog for simple confirmations or short messages.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          {/* Large Dialog */}
          <Dialog>
            <DialogTrigger render={<Button variant="secondary" size="sm" />}>
              Large Dialog
            </DialogTrigger>
            <DialogContent size="lg">
              <DialogHeader>
                <DialogTitle>Question Preview</DialogTitle>
                <DialogDescription>
                  A larger dialog for content that needs more room, such as previewing a question or article.
                </DialogDescription>
              </DialogHeader>
              <div className="py-2 text-sm text-muted-foreground">
                This dialog uses size=lg for wider content areas.
              </div>
            </DialogContent>
          </Dialog>

          {/* Confirm Dialog */}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            Delete Confirmation
          </Button>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Delete this question?"
            description="This action cannot be undone. The question and all associated response data will be permanently removed."
            confirmLabel="Delete Question"
            confirmVariant="destructive"
            onConfirm={() => {
              setConfirmOpen(false)
            }}
          />
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  22. Progress Bar                                             */}
      {/* ============================================================ */}
      <Section
        eyebrow="DATA DISPLAY"
        title="Progress Bar"
        subtitle="Five color variants across three sizes. Optional label and percentage display."
      >
        {/* Color variants */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Color Variants</p>
          <div className="max-w-md space-y-3">
            <ProgressBar value={85} variant="primary" label="Primary" showPercentage />
            <ProgressBar value={72} variant="success" label="Success" showPercentage />
            <ProgressBar value={45} variant="warning" label="Warning" showPercentage />
            <ProgressBar value={20} variant="danger" label="Danger" showPercentage />
            <ProgressBar value={60} variant="neutral" label="Neutral" showPercentage />
          </div>
        </div>

        {/* Sizes */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Sizes</p>
          <div className="max-w-md space-y-3">
            <ProgressBar value={65} size="sm" label="Small (sm)" showPercentage />
            <ProgressBar value={65} size="md" label="Medium (md)" showPercentage />
            <ProgressBar value={65} size="lg" label="Large (lg)" showPercentage />
          </div>
        </div>

        {/* Without label */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Bare (no label or percentage)</p>
          <div className="max-w-md space-y-2">
            <ProgressBar value={40} variant="primary" size="sm" />
            <ProgressBar value={70} variant="success" size="md" />
            <ProgressBar value={90} variant="warning" size="lg" />
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  23. Form Field                                               */}
      {/* ============================================================ */}
      <Section
        eyebrow="FORMS"
        title="Form Field"
        subtitle="Wrapper for form controls with label, required indicator, error, and hint text."
      >
        <div className="max-w-md space-y-4">
          <FormField label="Topic Name" htmlFor="demo-topic" hint="The display name shown to students.">
            <Input id="demo-topic" placeholder="e.g. Fire Safety Requirements" />
          </FormField>
          <FormField label="Email Address" htmlFor="demo-email" required>
            <Input id="demo-email" placeholder="you@example.com" />
          </FormField>
          <FormField label="Question Stem" htmlFor="demo-stem" required error="Question stem is required and must be at least 20 characters.">
            <Input id="demo-stem" placeholder="Enter the question..." aria-invalid="true" />
          </FormField>
          <FormField label="Difficulty" htmlFor="demo-difficulty" hint="Optional. Defaults to Medium if not specified.">
            <Input id="demo-difficulty" placeholder="Easy, Medium, or Hard" />
          </FormField>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  24. Mode Button                                              */}
      {/* ============================================================ */}
      <Section
        eyebrow="ACTIONS"
        title="Mode Button"
        subtitle="Study mode selectors. Five modes (Camp, Storm, Focus Review, Full Exam Simulation, Chill) in three variants."
      >
        {/* Solid */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Solid Variant</p>
          <div className="flex flex-wrap items-center gap-2">
            {(['camp', 'storm', 'blindspot', 'proof', 'chill'] as const).map((mode) => (
              <ModeButton
                key={`solid-${mode}`}
                mode={mode}
                variant="solid"
                active={activeModeButton === `solid-${mode}`}
                onClick={() => setActiveModeButton(activeModeButton === `solid-${mode}` ? null : `solid-${mode}`)}
              >
                {mode === 'blindspot' ? 'Focus Review' : mode === 'proof' ? 'Full Sim' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </ModeButton>
            ))}
          </div>
        </div>

        {/* Outline */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Outline Variant</p>
          <div className="flex flex-wrap items-center gap-2">
            {(['camp', 'storm', 'blindspot', 'proof', 'chill'] as const).map((mode) => (
              <ModeButton
                key={`outline-${mode}`}
                mode={mode}
                variant="outline"
                active={activeModeButton === `outline-${mode}`}
                onClick={() => setActiveModeButton(activeModeButton === `outline-${mode}` ? null : `outline-${mode}`)}
              >
                {mode === 'blindspot' ? 'Focus Review' : mode === 'proof' ? 'Full Sim' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </ModeButton>
            ))}
          </div>
        </div>

        {/* Ghost */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Ghost Variant</p>
          <div className="flex flex-wrap items-center gap-2">
            {(['camp', 'storm', 'blindspot', 'proof', 'chill'] as const).map((mode) => (
              <ModeButton
                key={`ghost-${mode}`}
                mode={mode}
                variant="ghost"
                active={activeModeButton === `ghost-${mode}`}
                onClick={() => setActiveModeButton(activeModeButton === `ghost-${mode}` ? null : `ghost-${mode}`)}
              >
                {mode === 'blindspot' ? 'Focus Review' : mode === 'proof' ? 'Full Sim' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </ModeButton>
            ))}
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  25. Icon Button                                              */}
      {/* ============================================================ */}
      <Section
        eyebrow="ACTIONS"
        title="Icon Button"
        subtitle="Compact icon-only buttons with optional tooltips. Three variants across three sizes."
      >
        {/* Ghost */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Ghost Variant</p>
          <div className="flex items-center gap-2">
            <IconButton icon={<Settings />} tooltip="Settings" variant="ghost" size="sm" />
            <IconButton icon={<Settings />} tooltip="Settings" variant="ghost" size="md" />
            <IconButton icon={<Settings />} tooltip="Settings" variant="ghost" size="lg" />
          </div>
        </div>

        {/* Outline */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Outline Variant</p>
          <div className="flex items-center gap-2">
            <IconButton icon={<BookOpen />} tooltip="Study Guide" variant="outline" size="sm" />
            <IconButton icon={<BookOpen />} tooltip="Study Guide" variant="outline" size="md" />
            <IconButton icon={<BookOpen />} tooltip="Study Guide" variant="outline" size="lg" />
          </div>
        </div>

        {/* Subtle */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Subtle Variant</p>
          <div className="flex items-center gap-2">
            <IconButton icon={<Target />} tooltip="Focus Mode" variant="subtle" size="sm" />
            <IconButton icon={<Target />} tooltip="Focus Mode" variant="subtle" size="md" />
            <IconButton icon={<Target />} tooltip="Focus Mode" variant="subtle" size="lg" />
          </div>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  26. Toolbar                                                  */}
      {/* ============================================================ */}
      <Section
        eyebrow="LAYOUT"
        title="Toolbar"
        subtitle="Group related icon buttons with dividers for editor-style controls."
      >
        <Card variant="default" size="md">
          <CardContent>
            <Toolbar>
              <ToolbarGroup>
                <IconButton icon={<Bold />} tooltip="Bold" variant="ghost" size="sm" />
                <IconButton icon={<Italic />} tooltip="Italic" variant="ghost" size="sm" />
                <IconButton icon={<Underline />} tooltip="Underline" variant="ghost" size="sm" />
              </ToolbarGroup>
              <ToolbarDivider />
              <ToolbarGroup>
                <IconButton icon={<AlignLeft />} tooltip="Align Left" variant="ghost" size="sm" />
                <IconButton icon={<AlignCenter />} tooltip="Align Center" variant="ghost" size="sm" />
              </ToolbarGroup>
              <ToolbarDivider />
              <ToolbarGroup>
                <IconButton icon={<List />} tooltip="Bullet List" variant="ghost" size="sm" />
                <IconButton icon={<BookOpen />} tooltip="Insert Citation" variant="ghost" size="sm" />
              </ToolbarGroup>
            </Toolbar>
          </CardContent>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/*  27. Action Card                                              */}
      {/* ============================================================ */}
      <Section
        eyebrow="LAYOUT"
        title="Action Card"
        subtitle="Clickable cards with icon, badge, title, description, and footer slots."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <ActionCard
            icon={<BookOpen className="w-5 h-5 text-primary" />}
            badge={<Badge variant="default">12 new</Badge>}
            title="Study Materials"
            subtitle="Architecture Licensure"
            description="Review wiki articles and reference materials for your upcoming exam."
            footer={
              <p className="text-xs text-muted-foreground">Last updated 2 hours ago</p>
            }
            onClick={() => {}}
          />
          <ActionCard
            icon={<Target className="w-5 h-5 text-emerald-600" />}
            badge={<Badge variant="outline">78%</Badge>}
            title="Practice Session"
            subtitle="Building Codes"
            description="Continue your practice session with 15 remaining questions."
            footer={
              <div className="flex items-center gap-2">
                <ProgressBar value={78} size="sm" variant="success" className="flex-1" />
                <span className="text-xs text-muted-foreground tabular-nums">78%</span>
              </div>
            }
            onClick={() => {}}
          />
          <ActionCard
            icon={<BarChart3 className="w-5 h-5 text-camp-orange" />}
            title="Performance Analytics"
            subtitle="Weekly Report"
            description="View your study trends and topic mastery breakdown."
            metadata={
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>Updated 30 min ago</span>
              </div>
            }
            onClick={() => {}}
          />
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  28. Question Dot Navigator                                   */}
      {/* ============================================================ */}
      <Section
        eyebrow="NAVIGATION"
        title="Question Dot Navigator"
        subtitle="Compact dot-based question navigation with color-coded statuses."
      >
        <Card variant="default" size="md">
          <CardContent>
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">20-question session (mixed statuses)</p>
              <QuestionDotNavigator
                dots={[
                  { index: 0, status: 'correct' },
                  { index: 1, status: 'correct' },
                  { index: 2, status: 'incorrect' },
                  { index: 3, status: 'correct' },
                  { index: 4, status: 'answered' },
                  { index: 5, status: 'answered' },
                  { index: 6, status: 'flagged' },
                  { index: 7, status: 'answered' },
                  { index: 8, status: 'current' },
                  { index: 9, status: 'unanswered' },
                  { index: 10, status: 'unanswered' },
                  { index: 11, status: 'unanswered' },
                  { index: 12, status: 'flagged' },
                  { index: 13, status: 'unanswered' },
                  { index: 14, status: 'unanswered' },
                  { index: 15, status: 'unanswered' },
                  { index: 16, status: 'unanswered' },
                  { index: 17, status: 'unanswered' },
                  { index: 18, status: 'unanswered' },
                  { index: 19, status: 'unanswered' },
                ] satisfies QuestionDot[]}
                onDotClick={(i) => toast({ title: `Navigate to Q${i + 1}` })}
              />
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted" />
                  <span className="text-[11px] text-muted-foreground">Unanswered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[11px] text-muted-foreground">Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-camp-orange" />
                  <span className="text-[11px] text-muted-foreground">Flagged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full ring-2 ring-primary" />
                  <span className="text-[11px] text-muted-foreground">Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald" />
                  <span className="text-[11px] text-muted-foreground">Correct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
                  <span className="text-[11px] text-muted-foreground">Incorrect</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/*  29. Page Header                                              */}
      {/* ============================================================ */}
      <Section
        eyebrow="LAYOUT"
        title="Page Header"
        subtitle="Top-of-page header with optional back link, subtitle, and action buttons."
      >
        <Card variant="default" size="md">
          <CardContent>
            <PageHeader
              title="Building Codes & Regulations"
              subtitle="Review articles and practice questions for PD 1096 and related codes."
              backHref="#"
              backLabel="Back to Dashboard"
              actions={
                <>
                  <Button variant="secondary" size="sm">Export</Button>
                  <Button size="sm" leftIcon={<Plus />}>Add Topic</Button>
                </>
              }
            />
          </CardContent>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/*  30. Floating Panel                                           */}
      {/* ============================================================ */}
      <Section
        eyebrow="OVERLAYS"
        title="Floating Panel"
        subtitle="A portal-rendered panel for secondary workflows. Supports blur backdrop and draggable positioning."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFloatingPanelOpen(true)}
          >
            Open Panel (blur backdrop)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFloatingPanelDraggableOpen(true)}
          >
            Open Draggable Panel
          </Button>
        </div>

        <FloatingPanel
          open={floatingPanelOpen}
          onClose={() => setFloatingPanelOpen(false)}
          title="Study Notes"
          subtitle="Fire Code (RA 9514)"
          backdrop="blur"
          width={520}
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setFloatingPanelOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => setFloatingPanelOpen(false)}>
                Save Notes
              </Button>
            </div>
          }
        >
          <div className="p-4 space-y-3">
            <p className="text-sm text-foreground">
              Key takeaway: Fire zones are determined by the building occupancy classification
              and the type of construction used.
            </p>
            <p className="text-xs text-muted-foreground">
              Reference: RA 9514, Rule 10, Section 3. Always cross-reference with
              local fire marshal requirements for specific jurisdictions.
            </p>
          </div>
        </FloatingPanel>

        <FloatingPanel
          open={floatingPanelDraggableOpen}
          onClose={() => setFloatingPanelDraggableOpen(false)}
          title="Quick Reference"
          subtitle="Drag to reposition"
          draggable
          dragStorageKey="demo-draggable-panel"
          backdrop="none"
          width={400}
        >
          <div className="p-4 space-y-2">
            <p className="text-sm text-foreground font-medium">Minimum Corridor Widths (PD 1096)</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>Residential egress: 1.20m</li>
              <li>Residential non-egress: 1.00m</li>
              <li>Commercial egress: 1.50m</li>
              <li>Assembly occupancy: 1.80m</li>
            </ul>
          </div>
        </FloatingPanel>
      </Section>

      {/* ============================================================ */}
      {/*  31. App Drawer                                               */}
      {/* ============================================================ */}
      <Section
        eyebrow="OVERLAYS"
        title="App Drawer"
        subtitle="Slide-in panel for settings, filters, or secondary content."
      >
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDrawerOpen(true)}
          >
            Open Drawer (right)
          </Button>
        </div>

        <AppDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Session Filters"
          subtitle="Narrow down your practice questions"
          side="right"
          size="md"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>
                Reset
              </Button>
              <Button size="sm" onClick={() => setDrawerOpen(false)}>
                Apply Filters
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <FormField label="Difficulty" htmlFor="drawer-difficulty">
              <Input id="drawer-difficulty" placeholder="All difficulties" />
            </FormField>
            <FormField label="Topic" htmlFor="drawer-topic">
              <Input id="drawer-topic" placeholder="Search topics..." />
            </FormField>
            <FormField label="Status" htmlFor="drawer-status" hint="Filter by question review status.">
              <Input id="drawer-status" placeholder="All statuses" />
            </FormField>
          </div>
        </AppDrawer>
      </Section>

      {/* ============================================================ */}
      {/*  32. Sidebar Nav                                              */}
      {/* ============================================================ */}
      <Section
        eyebrow="NAVIGATION"
        title="Sidebar Nav"
        subtitle="Vertical navigation groups with icons, active states, badges, and dividers."
      >
        <Card variant="default" size="md">
          <CardContent>
            <div className="max-w-xs">
              <SidebarNavGroup label="Study">
                <SidebarNavItem
                  href="#"
                  label="Dashboard"
                  icon={<Home />}
                  active
                />
                <SidebarNavItem
                  href="#"
                  label="Practice Sessions"
                  icon={<Target />}
                  badge={<Badge variant="secondary" className="text-[11px] h-5 px-1.5">3</Badge>}
                />
                <SidebarNavItem
                  href="#"
                  label="Wiki Articles"
                  icon={<BookOpen />}
                />
              </SidebarNavGroup>
              <SidebarNavDivider />
              <SidebarNavGroup label="Admin">
                <SidebarNavItem
                  href="#"
                  label="Question Bank"
                  icon={<Database />}
                />
                <SidebarNavItem
                  href="#"
                  label="Taxonomy"
                  icon={<FolderTree />}
                />
                <SidebarNavItem
                  href="#"
                  label="Design System"
                  icon={<Palette />}
                />
              </SidebarNavGroup>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/*  33. Content Sidebar                                          */}
      {/* ============================================================ */}
      <Section
        eyebrow="LAYOUT"
        title="Content Sidebar"
        subtitle="Article companion panel. Section order: Sources → Feedback → Related Articles → Related Topics → Table of Contents. TOC uses a vertical blue line to track scroll position."
      >
        <Card variant="default" size="sm" className="overflow-hidden">
          <div className="flex">
            {/* Simulated main content area */}
            <div className="flex-1 p-4">
              <p className="text-sm text-muted-foreground">
                Main content area. The sidebar sits to the right with collapsible sections in a fixed order.
              </p>
            </div>
            {/* Content Sidebar demo (not sticky for gallery purposes) */}
            <ContentSidebar title="On This Page" sticky={false} className="h-auto">
              {/* 1. Sources (always first) — compact trigger with popover */}
              <ContentSidebarSection title="Sources">
                <ContentSidebarPopover label="3 sources">
                  <ContentSidebarSources
                    sources={[
                      { label: 'PD 1096 — National Building Code', href: '#' },
                      { label: 'RA 9514 — Fire Code of the Philippines', href: '#' },
                      { label: 'NSCP 2015 — Structural Code' },
                    ]}
                  />
                </ContentSidebarPopover>
              </ContentSidebarSection>

              {/* 2. Feedback (always second) */}
              <ContentSidebarSection title="Feedback">
                <ContentSidebarFeedback
                  onHelpful={() => {}}
                  onNotHelpful={() => {}}
                  onReport={() => {}}
                />
              </ContentSidebarSection>

              {/* 3. Related Articles / Metadata — compact trigger with popover */}
              <ContentSidebarSection title="Related Articles">
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Last updated</span>
                    <span className="text-foreground">Mar 20, 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Questions</span>
                    <span className="text-foreground">24</span>
                  </div>
                </div>
                <ContentSidebarPopover label="2 related articles">
                  <ul className="space-y-2 text-xs">
                    <li><a href="#" className="text-primary hover:underline">Fire Resistance Ratings</a></li>
                    <li><a href="#" className="text-primary hover:underline">Structural Fire Protection</a></li>
                  </ul>
                </ContentSidebarPopover>
              </ContentSidebarSection>

              {/* 4. Related Topics — compact trigger with popover */}
              <ContentSidebarSection title="Related Topics">
                <ContentSidebarPopover label="3 related topics">
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="hover:text-foreground cursor-pointer">Building Permits</li>
                    <li className="hover:text-foreground cursor-pointer">Accessibility (BP 344)</li>
                    <li className="hover:text-foreground cursor-pointer">Zoning Regulations</li>
                  </ul>
                </ContentSidebarPopover>
              </ContentSidebarSection>

              {/* 5. Table of Contents (always last, with scroll-tracking blue line) */}
              <ContentSidebarSection title="Table of Contents" collapsible defaultOpen>
                <div className="-ml-1">
                  <ContentSidebarTocLink href="#overview" active>Overview</ContentSidebarTocLink>
                  <ContentSidebarTocLink href="#fire-zones">Fire Zones</ContentSidebarTocLink>
                  <ContentSidebarTocLink href="#fire-zones-residential" depth={1}>Residential</ContentSidebarTocLink>
                  <ContentSidebarTocLink href="#fire-zones-commercial" depth={1}>Commercial</ContentSidebarTocLink>
                  <ContentSidebarTocLink href="#construction-types">Construction Types</ContentSidebarTocLink>
                  <ContentSidebarTocLink href="#occupancy-groups">Occupancy Groups</ContentSidebarTocLink>
                  <ContentSidebarTocLink href="#summary">Summary</ContentSidebarTocLink>
                </div>
              </ContentSidebarSection>
            </ContentSidebar>
          </div>
        </Card>
      </Section>

      {/* ============================================================ */}
      {/*  34. Callout                                                  */}
      {/* ============================================================ */}
      <Section
        eyebrow="WIKI CONTENT"
        title="Callout"
        subtitle="Unified callout component with icon-based and eyebrow-style variants for wiki content."
      >
        {/* Standard icon variants */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Standard Variants (icon + label)</p>
          <div className="space-y-2">
            <Callout variant="note">
              This is a <strong>note</strong> callout. Use it for supplementary information the reader should be aware of.
            </Callout>
            <Callout variant="warning">
              This is a <strong>warning</strong> callout. Use it for potential pitfalls or common mistakes on the exam.
            </Callout>
            <Callout variant="tip">
              This is a <strong>tip</strong> callout. Use it for helpful study strategies or memory aids.
            </Callout>
            <Callout variant="example">
              This is an <strong>example</strong> callout. Use it for worked examples and sample calculations.
            </Callout>
            <Callout variant="info">
              This is an <strong>info</strong> callout. Use it for general-purpose informational content.
            </Callout>
            <Callout variant="danger">
              This is a <strong>danger</strong> callout. Use it for critical mistakes that could cost points on the exam.
            </Callout>
            <Callout variant="requirement">
              This is a <strong>requirement</strong> callout. Use it for mandatory code provisions and legal requirements.
            </Callout>
          </div>
        </div>

        {/* Eyebrow variants */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Eyebrow Variants (mono label, no icon)</p>
          <div className="space-y-2">
            <Callout variant="most-tested">
              Fire resistance ratings of structural elements appear in nearly every board exam cycle. Focus on the 1-hour, 2-hour, and 4-hour rating thresholds.
            </Callout>
            <Callout variant="ale-watch">
              The ALE has recently shifted emphasis toward accessibility provisions under BP 344. Expect 2-3 questions on ramp slopes and accessible toilet dimensions.
            </Callout>
            <Callout variant="version-alert">
              The 2015 NSCP introduced significant changes to seismic load calculations. Ensure you are studying the current edition, not the 2001 version.
            </Callout>
          </div>
        </div>

        {/* Convenience wrappers */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Convenience Wrappers (Note, Warn, Tip, Example)</p>
          <div className="space-y-2">
            <Note>This uses the <strong>Note</strong> convenience wrapper component.</Note>
            <Warn>This uses the <strong>Warn</strong> convenience wrapper component.</Warn>
            <Tip>This uses the <strong>Tip</strong> convenience wrapper component.</Tip>
            <Example>This uses the <strong>Example</strong> convenience wrapper component.</Example>
          </div>
        </div>

        {/* CalloutBox alias */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">CalloutBox (backward-compatible alias for eyebrow variants)</p>
          <CalloutBox type="most-tested">
            CalloutBox renders the same eyebrow-style layout via a type prop.
          </CalloutBox>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  35. Accordion                                                */}
      {/* ============================================================ */}
      <Section
        eyebrow="WIKI CONTENT"
        title="Accordion"
        subtitle="Collapsible content panels for FAQ-style or grouped wiki content. Single-open by default."
      >
        {/* Single-open mode */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Single-open Mode (default)</p>
          <Accordion>
            <AccordionItem title="What is Item Response Theory (IRT)?">
              <p>
                IRT is a psychometric framework that models the relationship between a test-taker&apos;s
                latent ability (theta) and the probability of answering an item correctly. SlateCamp uses
                the 2-parameter logistic model, which accounts for both item difficulty and discrimination.
              </p>
            </AccordionItem>
            <AccordionItem title="How does spaced repetition work?">
              <p>
                Spaced repetition schedules reviews at increasing intervals based on how well you know
                each item. Items you struggle with appear more frequently, while mastered items are
                spaced further apart. This optimizes long-term retention with minimal study time.
              </p>
            </AccordionItem>
            <AccordionItem title="What are the ALE exam domains?">
              <p>
                The Architecture Licensure Examination covers multiple domains including Building
                Technology, Structural Design, Building Codes and Laws, Architectural Design, and
                Professional Practice. Each domain is weighted differently in the final score.
              </p>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Multi-open mode */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Multi-open Mode (allowMultiple)</p>
          <Accordion allowMultiple>
            <AccordionItem title="Camp Mode">
              <p>
                A focused practice session with curated questions from your weakest topics. Questions
                are selected using IRT to target your current ability level for maximum learning.
              </p>
            </AccordionItem>
            <AccordionItem title="Storm Mode">
              <p>
                A rapid-fire session that tests breadth of knowledge across all domains. Timer-based
                with shorter per-question limits to build exam-day pacing skills.
              </p>
            </AccordionItem>
            <AccordionItem title="Chill Mode">
              <p>
                An untimed, low-pressure review mode. Browse questions at your own pace with immediate
                feedback and detailed explanations. Ideal for initial learning.
              </p>
            </AccordionItem>
          </Accordion>
        </div>
      </Section>

      {/* ============================================================ */}
      {/*  36. Sidebar Nav (Contained Preview)                          */}
      {/* ============================================================ */}
      <Section
        eyebrow="NAVIGATION"
        title="Sidebar Nav (Contained Preview)"
        subtitle="A self-contained preview of the sidebar navigation pattern with grouped items, icons, active states, and dividers."
      >
        <div className="rounded-lg border border-border bg-background h-[300px] overflow-y-auto max-w-xs p-3">
          <SidebarNavGroup label="Main">
            <SidebarNavItem
              href="#"
              label="Home"
              icon={<Home />}
              active
            />
            <SidebarNavItem
              href="#"
              label="Study Wiki"
              icon={<BookOpen />}
            />
            <SidebarNavItem
              href="#"
              label="Performance"
              icon={<BarChart3 />}
              badge={<Badge variant="secondary" className="text-[11px] h-5 px-1.5">New</Badge>}
            />
            <SidebarNavItem
              href="#"
              label="Question Bank"
              icon={<Database />}
            />
          </SidebarNavGroup>
          <SidebarNavDivider />
          <SidebarNavGroup label="Settings">
            <SidebarNavItem
              href="#"
              label="Preferences"
              icon={<Settings />}
            />
            <SidebarNavItem
              href="#"
              label="Profile"
              icon={<User />}
            />
          </SidebarNavGroup>
        </div>
      </Section>
    </div>
  )
}

export default DesignSystemPage
