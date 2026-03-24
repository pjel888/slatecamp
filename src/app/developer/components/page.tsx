import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/portal/CodeBlock'
import { PropTable } from '@/app/developer/_components/PropTable'
import { cn } from '@/lib/utils'

/* Wiki MDX components — imported for live previews */
import { Note, Warn, Tip, Callout } from '@/components/wiki/Callout'
import { LawCallout } from '@/components/wiki/LawCallout'
import { WikiCalloutBox } from '@/components/wiki/WikiCalloutBox'
import { WikiPartHeader } from '@/components/wiki/WikiPartHeader'
import { WikiChangedPill } from '@/components/wiki/WikiChangedPill'
import { KeyValues } from '@/components/wiki/KeyValues'
import { FormulaBlock } from '@/components/wiki/FormulaBlock'
import { Tabs as WikiTabs, Tab } from '@/components/wiki/WikiTabs'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { WikiMistakeCard } from '@/components/wiki/WikiMistakeCard'
import { WikiMistakeList } from '@/components/wiki/WikiMistakeList'

export const metadata = {
  title: 'Component Library — SlateCamp Developer Portal',
  description: 'Complete reference for all UI primitives, MDX components, and interactive widgets.',
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const PathBadge = ({ path }: { path: string }) => (
  <Badge variant="default" size="xs" className="font-[family-name:var(--font-dm-mono)] shrink-0">
    {path}
  </Badge>
)

const MdxBadge = () => (
  <Badge variant="primary" size="xs" className="font-[family-name:var(--font-dm-mono)] shrink-0">
    MDX Component
  </Badge>
)

const WidgetBadge = ({ group }: { group: string }) => (
  <Badge variant="purple" size="xs" className="font-[family-name:var(--font-dm-mono)] shrink-0">
    {group}
  </Badge>
)

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2 mt-6 first:mt-0">
    {children}
  </p>
)

const PreviewBox = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('rounded-md border border-border/60 bg-muted/20 p-4 overflow-hidden space-y-3', className)}>
    {children}
  </div>
)

const ComponentCard = ({
  name,
  path,
  description,
  badge,
  children,
}: {
  name: string
  path?: string
  description: string
  badge?: React.ReactNode
  children?: React.ReactNode
}) => (
  <Card variant="default" size="sm" className="gap-3">
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[13px] font-semibold text-foreground font-[family-name:var(--font-display)]">
          {name}
        </span>
        {badge}
      </div>
      {path && <PathBadge path={path} />}
    </div>
    <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
    {children}
  </Card>
)

const SimpleRow = ({
  name,
  path,
  description,
}: {
  name: string
  path: string
  description: string
}) => (
  <div className="flex items-start gap-3 py-2 border-b border-border last:border-0">
    <span className="text-[12px] font-semibold text-foreground w-40 shrink-0 font-[family-name:var(--font-display)]">
      {name}
    </span>
    <span className="font-[family-name:var(--font-dm-mono)] text-[10px] text-muted-foreground w-48 shrink-0">
      {path}
    </span>
    <span className="text-[11px] text-muted-foreground leading-relaxed">{description}</span>
  </div>
)

/* ------------------------------------------------------------------ */
/* Tab 1 — UI Primitives                                               */
/* ------------------------------------------------------------------ */

const UIPrimitivesTab = () => (
  <div className="space-y-4">
    <SectionLabel>Core Interactive</SectionLabel>

    {/* Button */}
    <ComponentCard
      name="Button"
      path="src/components/ui/button.tsx"
      description="Primary action component built on Base UI. Supports multiple visual variants, sizes, icon slots, and an async loading state. Also exports PendingButton (form-state-aware) and SubmitButton (React DOM useFormStatus)."
    >
      <PropTable
        props={[
          { name: 'variant', type: "'primary' | 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link' | 'success' | 'warmCta'", default: "'default'" },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'default' | 'lg' | 'xl' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg'", default: "'default'" },
          { name: 'leftIcon', type: 'React.ReactNode', default: '—' },
          { name: 'rightIcon', type: 'React.ReactNode', default: '—' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Replaces left icon with spinner, disables pointer events' },
          { name: 'fullWidth', type: 'boolean', default: 'false' },
          { name: 'disabled', type: 'boolean', default: 'false' },
          { name: 'children', type: 'React.ReactNode', required: true },
        ]}
      />
      <CodeBlock
        language="tsx"
        code={`import { Button, PendingButton, SubmitButton } from '@/components/ui/button'

<Button variant="primary" size="md">Save changes</Button>
<Button variant="outline" loading>Saving...</Button>
<Button variant="ghost" size="icon-sm"><TrashIcon /></Button>
<PendingButton pending={isLoading} pendingLabel="Uploading...">Upload</PendingButton>
<SubmitButton>Create account</SubmitButton>`}
      />
    </ComponentCard>

    {/* Input */}
    <ComponentCard
      name="Input / SearchInput"
      path="src/components/ui/input.tsx"
      description="Text input built on Base UI Input. SearchInput adds a search icon, debounced onChange, clear button, and optional keyboard shortcut hint."
    >
      <PropTable
        props={[
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
          { name: 'type', type: 'string', default: "'text'" },
          { name: 'className', type: 'string', default: '—' },
        ]}
      />
      <PropTable
        props={[
          { name: 'value', type: 'string', default: '—', description: 'SearchInput: controlled value' },
          { name: 'onChange', type: '(value: string) => void', default: '—', description: 'SearchInput: debounced callback' },
          { name: 'onClear', type: '() => void', default: '—' },
          { name: 'debounceMs', type: 'number', default: '300' },
          { name: 'shortcutHint', type: 'string', default: '—', description: "e.g. '⌘K'" },
          { name: 'loading', type: 'boolean', default: 'false' },
        ]}
      />
      <CodeBlock
        language="tsx"
        code={`import { Input, SearchInput } from '@/components/ui/input'

<Input size="md" placeholder="Enter value..." />
<SearchInput
  placeholder="Search articles..."
  shortcutHint="⌘K"
  onChange={(val) => setQuery(val)}
  debounceMs={200}
/>`}
      />
    </ComponentCard>

    <SectionLabel>Layout & Containment</SectionLabel>

    {/* Card */}
    <ComponentCard
      name="Card"
      path="src/components/ui/card.tsx"
      description="Flexible container with variant-driven styles. interactive adds hover/focus states for clickable cards. accent-left renders a colored left border for callout-style cards."
    >
      <PropTable
        props={[
          { name: 'variant', type: "'default' | 'interactive' | 'selected' | 'accent-left' | 'feature' | 'ghost'", default: "'default'" },
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'" },
          { name: 'className', type: 'string', default: '—' },
        ]}
      />
      <CodeBlock
        language="tsx"
        code={`import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter } from '@/components/ui/card'

<Card variant="interactive" size="sm">
  <CardHeader>
    <CardTitle>Article title</CardTitle>
    <CardDescription>Supporting text</CardDescription>
    <CardAction><Badge>New</Badge></CardAction>
  </CardHeader>
  <CardContent>Body content</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>`}
      />
    </ComponentCard>

    {/* Tabs */}
    <ComponentCard
      name="Tabs"
      path="src/components/ui/tabs.tsx"
      description="Tab navigation built on Base UI. The variant is set on TabsList and automatically inherited by all TabsTrigger children via CSS group selectors."
    >
      <PropTable
        props={[
          { name: 'variant', type: "'underline' | 'line' | 'pill' | 'segmented'", default: "'underline'", description: 'Prop on TabsList' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Prop on Tabs root' },
        ]}
      />
      <CodeBlock
        language="tsx"
        code={`import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

<Tabs defaultValue="overview">
  <TabsList variant="underline">
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content</TabsContent>
  <TabsContent value="details">Details content</TabsContent>
</Tabs>`}
      />
    </ComponentCard>

    <SectionLabel>Feedback & Status</SectionLabel>

    {/* Badge */}
    <ComponentCard
      name="Badge"
      path="src/components/ui/badge.tsx"
      description="Inline label for status, categories, and metadata. Semantic presets (StatusBadge, DifficultyBadge, etc.) enforce consistent vocabulary across the app."
    >
      <PropTable
        props={[
          { name: 'variant', type: "'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' | 'outline' | 'secondary'", default: "'default'" },
          { name: 'size', type: "'xs' | 'sm' | 'md' | 'lg'", default: "'sm'" },
          { name: 'pill', type: 'boolean', default: 'false', description: 'Fully rounded (rounded-full)' },
          { name: 'dot', type: 'boolean', default: 'false', description: 'Renders a small color dot before text' },
          { name: 'icon', type: 'React.ReactNode', default: '—' },
          { name: 'dismissible', type: 'boolean', default: 'false' },
          { name: 'onDismiss', type: '() => void', default: '—' },
        ]}
      />
      <CodeBlock
        language="tsx"
        code={`import { Badge, StatusBadge, DifficultyBadge, SessionModeBadge, MasteryBadge, VerificationBadge } from '@/components/ui/badge'

<Badge variant="success" size="sm" dot>Published</Badge>
<Badge variant="primary" pill size="xs">New</Badge>
<StatusBadge status="published" />
<DifficultyBadge level="intermediate" />
<SessionModeBadge mode="camp" />
<MasteryBadge tier="proficient" />
<VerificationBadge status="clean" />`}
      />
    </ComponentCard>

    {/* Dialog */}
    <ComponentCard
      name="Dialog / ConfirmDialog"
      path="src/components/ui/dialog.tsx"
      description="Modal dialog built on Base UI. ConfirmDialog is a pre-wired convenience wrapper for yes/no confirmation flows with optional loading state."
    >
      <PropTable
        props={[
          { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Prop on DialogContent' },
          { name: 'showCloseButton', type: 'boolean', default: 'true', description: 'Prop on DialogContent' },
        ]}
      />
      <PropTable
        props={[
          { name: 'open', type: 'boolean', required: true, description: 'ConfirmDialog' },
          { name: 'onOpenChange', type: '(open: boolean) => void', required: true },
          { name: 'title', type: 'string', required: true },
          { name: 'description', type: 'string', default: '—' },
          { name: 'confirmLabel', type: 'string', default: "'Confirm'" },
          { name: 'cancelLabel', type: 'string', default: "'Cancel'" },
          { name: 'confirmVariant', type: "'primary' | 'destructive'", default: "'primary'" },
          { name: 'onConfirm', type: '() => void | Promise<void>', required: true },
          { name: 'loading', type: 'boolean', default: 'false' },
        ]}
      />
      <CodeBlock
        language="tsx"
        code={`import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, ConfirmDialog } from '@/components/ui/dialog'

<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent size="md">
    <DialogHeader>
      <DialogTitle>Edit record</DialogTitle>
      <DialogDescription>Make changes and save.</DialogDescription>
    </DialogHeader>
    <DialogFooter showCloseButton>
      <Button variant="primary">Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<ConfirmDialog
  open={open}
  onOpenChange={setOpen}
  title="Delete article?"
  description="This action cannot be undone."
  confirmVariant="destructive"
  onConfirm={handleDelete}
/>`}
      />
    </ComponentCard>

    {/* Skeleton */}
    <ComponentCard
      name="Skeleton"
      path="src/components/ui/skeleton.tsx"
      description="Animated loading placeholder. Pre-composed skeletons match the layout of common patterns — use these instead of custom shimmer implementations."
    >
      <CodeBlock
        language="tsx"
        code={`import { Skeleton, CardSkeleton, TableRowSkeleton, StatCardSkeleton, ArticleListSkeleton, QuestionCardSkeleton, ScoreRingSkeleton } from '@/components/ui/skeleton'

<CardSkeleton className="max-w-sm" />
<TableRowSkeleton columns={5} />
<StatCardSkeleton />
<ArticleListSkeleton rows={8} />
<QuestionCardSkeleton />
<ScoreRingSkeleton size="lg" />`}
      />
    </ComponentCard>

    {/* Tooltip */}
    <ComponentCard
      name="Tooltip"
      path="src/components/ui/tooltip.tsx"
      description="Accessible tooltip built on Base UI. Wrap the app in TooltipProvider once (already in ThemeProvider). TooltipTrigger accepts asChild to wrap any element."
    >
      <PropTable
        props={[
          { name: 'delay', type: 'number', default: '300', description: 'Prop on TooltipProvider (ms)' },
          { name: 'side', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Prop on TooltipContent' },
          { name: 'sideOffset', type: 'number', default: '4' },
          { name: 'align', type: "'start' | 'center' | 'end'", default: "'center'" },
        ]}
      />
      <CodeBlock
        language="tsx"
        code={`import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'

<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon-sm"><InfoIcon /></Button>
  </TooltipTrigger>
  <TooltipContent side="top">Readiness score reflects IRT mastery estimate</TooltipContent>
</Tooltip>`}
      />
    </ComponentCard>

    <SectionLabel>Additional Primitives</SectionLabel>

    <div className="rounded-xs border border-border overflow-hidden">
      <SimpleRow name="Select" path="src/components/ui/select.tsx" description="Dropdown select built on Base UI. Exports Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator." />
      <SimpleRow name="Sheet" path="src/components/ui/sheet.tsx" description="Slide-in panel (drawer) built on Base UI Dialog. Exports Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription." />
      <SimpleRow name="AlertDialog" path="src/components/ui/alert-dialog.tsx" description="Blocking confirmation dialog. Use ConfirmDialog from dialog.tsx for most flows; AlertDialog for browser-native-style blocking alerts." />
      <SimpleRow name="Avatar" path="src/components/ui/avatar.tsx" description="User avatar with image and initials fallback. Exports Avatar, AvatarImage, AvatarFallback." />
      <SimpleRow name="Calendar" path="src/components/ui/calendar.tsx" description="Date-picker calendar grid. Built on react-day-picker. Use inside a Popover for inline date pickers." />
      <SimpleRow name="Command" path="src/components/ui/command.tsx" description="Command palette / combobox. Powers the Omnibar. Exports Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandSeparator." />
      <SimpleRow name="DropdownMenu" path="src/components/ui/dropdown-menu.tsx" description="Context/actions menu. Exports DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel." />
      <SimpleRow name="Label" path="src/components/ui/label.tsx" description="Accessible form label. Associates with input via htmlFor or wrapping." />
      <SimpleRow name="Popover" path="src/components/ui/popover.tsx" description="Floating content anchor. Exports Popover, PopoverTrigger, PopoverContent. Used for inline pickers and rich tooltips." />
      <SimpleRow name="Progress" path="src/components/ui/progress.tsx" description="Linear progress bar. Accepts value (0–100) and optional color override." />
      <SimpleRow name="RadioGroup" path="src/components/ui/radio-group.tsx" description="Accessible radio button group. Exports RadioGroup, RadioGroupItem." />
      <SimpleRow name="ScrollArea" path="src/components/ui/scroll-area.tsx" description="Styled scroll container with custom scrollbar. Wraps content in a fixed-height region." />
      <SimpleRow name="Separator" path="src/components/ui/separator.tsx" description="Visual divider. Supports horizontal (default) and vertical orientation." />
      <SimpleRow name="Slider" path="src/components/ui/slider.tsx" description="Range slider input. Built on Base UI. Supports min, max, step, defaultValue, onValueChange." />
      <SimpleRow name="Switch" path="src/components/ui/switch.tsx" description="Toggle switch. Controlled via checked and onCheckedChange." />
      <SimpleRow name="Textarea" path="src/components/ui/textarea.tsx" description="Multi-line text input. Matches Input sizing tokens. Supports auto-resize variant." />
      <SimpleRow name="Toast / Toaster" path="src/components/ui/toast.tsx" description="Notification toasts. Import useToast hook from @/lib/hooks/use-toast. Toast displays; Toaster is the global renderer." />
      <SimpleRow name="CloseButton" path="src/components/ui/close-button.tsx" description="Semantic close/dismiss button. Pre-styled ghost icon button with X icon and sr-only label." />
      <SimpleRow name="IconButton" path="src/components/ui/icon-button.tsx" description="Button variant for icon-only actions. Enforces accessible aria-label prop at the type level." />
      <SimpleRow name="ModeButton" path="src/components/ui/mode-button.tsx" description="Study mode selector button (Camp, Storm, Proof, etc.). Renders mode icon + label in a selectable tile format." />
      <SimpleRow name="FormField" path="src/components/ui/form-field.tsx" description="Label + input + error message layout wrapper. Passes aria-describedby and aria-invalid to child input automatically." />
      <SimpleRow name="InputGroup" path="src/components/ui/input-group.tsx" description="Compound input with leading/trailing addons (icons, text, buttons). Manages border-radius merging." />
      <SimpleRow name="ProgressBar" path="src/components/ui/progress-bar.tsx" description="Labeled progress bar with percentage text. Used in readiness and pacing displays." />
      <SimpleRow name="Toolbar" path="src/components/ui/toolbar.tsx" description="Horizontal action toolbar. Groups buttons with correct spacing and keyboard navigation via role=toolbar." />
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/* Tab 2 — MDX Components                                              */
/* ------------------------------------------------------------------ */

const MdxComponentsTab = () => (
  <div className="space-y-4">
    <SectionLabel>Callouts</SectionLabel>

    <ComponentCard
      name="Callout / Note / Warn / Tip / Example"
      badge={<MdxBadge />}
      description="Unified callout component. Named exports (Note, Warn, Tip, Example) are MDX-friendly shorthands. Variants: note, warning, tip, example, info, danger, requirement, exam-tip, authority, most-tested, ale-watch, version-alert."
    >
      <PropTable
        props={[
          { name: 'variant', type: "'note' | 'warning' | 'tip' | 'example' | 'info' | 'danger' | 'requirement' | 'exam-tip' | 'authority' | 'most-tested' | 'ale-watch' | 'version-alert'", default: "'note'" },
          { name: 'title', type: 'string', default: 'variant label', description: 'Override the eyebrow/label text' },
          { name: 'dismissible', type: 'boolean', default: 'false' },
          { name: 'onDismiss', type: '() => void', default: '—' },
          { name: 'children', type: 'React.ReactNode', required: true },
        ]}
      />
      <PreviewBox>
        <Note>This is the default note callout — blue info style.</Note>
        <Warn title="Important">Check minimum egress width before sizing corridors.</Warn>
        <Tip>Mnemonics work best when tied to a physical memory anchor.</Tip>
        <Callout variant="most-tested">Section 501 appears on 60% of board exams.</Callout>
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<Note>This is the default note callout — blue info style.</Note>

<Warn title="Important">Check minimum egress width before sizing corridors.</Warn>

<Tip>Mnemonics work best when tied to a physical memory anchor.</Tip>

<Callout variant="most-tested">Section 501 appears on 60% of board exams.</Callout>

<Callout variant="ale-watch">This provision changed in the 2023 IRR revision.</Callout>`}
      />
    </ComponentCard>

    <ComponentCard
      name="AlertBox"
      badge={<MdxBadge />}
      description="Semantic alert block for requirement, warning, info, and danger contexts. Backward-compatible alias over Callout."
    >
      <PropTable
        props={[
          { name: 'type', type: "'requirement' | 'warning' | 'info' | 'danger'", default: "'info'" },
          { name: 'children', type: 'React.ReactNode', required: true },
        ]}
      />
      <CodeBlock
        language="mdx"
        code={`<AlertBox type="requirement">
  Minimum corridor width: 1.10 m for residential, 1.50 m for commercial.
</AlertBox>

<AlertBox type="danger">
  Non-compliance voids occupancy permit under Section 601.
</AlertBox>`}
      />
    </ComponentCard>

    <ComponentCard
      name="ExamTip"
      badge={<MdxBadge />}
      description="High-priority exam callout with a target icon. Use for single-sentence board exam focus points."
    >
      <CodeBlock
        language="mdx"
        code={`<ExamTip>
  The ALE will almost always test Section 401 corridor widths — memorize all three occupancy classes.
</ExamTip>`}
      />
    </ComponentCard>

    <SectionLabel>Legal Citations</SectionLabel>

    <ComponentCard
      name="LawCallout"
      badge={<MdxBadge />}
      description="Color-coded legal citation block for Philippine building regulations. Each code (nbcp, bp344, ra9514, bp220, pd957, irr) renders a distinct color scheme with law name eyebrow."
    >
      <PropTable
        props={[
          { name: 'code', type: "'nbcp' | 'bp344' | 'ra9514' | 'bp220' | 'pd957' | 'irr'", required: true },
          { name: 'section', type: 'string', default: '—', description: "Appended to eyebrow, e.g. 'Section 401'" },
          { name: 'title', type: 'string', default: '—' },
          { name: 'children', type: 'React.ReactNode', required: true },
        ]}
      />
      <PreviewBox>
        <LawCallout code="nbcp" section="Section 401">
          Minimum corridor width: 1.10 m for residential occupancies, 1.50 m for all others.
        </LawCallout>
        <LawCallout code="bp344" section="Section 7.1" title="Accessible Parking">
          At least one in every 50 parking slots shall be designated for PWDs.
        </LawCallout>
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<LawCallout code="nbcp" section="Section 401">
  Minimum corridor width: 1.10 m for residential occupancies, 1.50 m for all others.
</LawCallout>

<LawCallout code="bp344" section="Section 7.1" title="Accessible Parking">
  At least one in every 50 parking slots shall be designated for PWDs.
</LawCallout>

<LawCallout code="ra9514">
  Fire-rated assemblies shall maintain rating for full floor-to-floor height.
</LawCallout>`}
      />
    </ComponentCard>

    <ComponentCard
      name="AuthorityContent"
      badge={<MdxBadge />}
      description="Italicized legal citation block for direct quotes from statutory text. Renders with a Scales icon."
    >
      <CodeBlock
        language="mdx"
        code={`<AuthorityContent>
  "No building shall be constructed, altered, or repaired without a building permit..." — PD 1096, Section 301
</AuthorityContent>`}
      />
    </ComponentCard>

    <SectionLabel>Exam Components</SectionLabel>

    <ComponentCard
      name="WikiCalloutBox"
      badge={<MdxBadge />}
      description="Eyebrow-style alert for exam-specific contexts. Supports most-tested, ale-watch, and version-alert types."
    >
      <PropTable
        props={[
          { name: 'type', type: "'most-tested' | 'ale-watch' | 'version-alert'", required: true },
          { name: 'children', type: 'React.ReactNode', required: true },
        ]}
      />
      <PreviewBox>
        <WikiCalloutBox type="most-tested">
          Section 701 (Exit Requirements) appears in 3 of the last 5 boards.
        </WikiCalloutBox>
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<WikiCalloutBox type="most-tested">
  Section 701 (Exit Requirements) appears in 3 of the last 5 boards.
</WikiCalloutBox>`}
      />
    </ComponentCard>

    <ComponentCard
      name="WikiExamTable"
      badge={<MdxBadge />}
      description="Compact comparison table optimized for exam quick-reference. Renders with alternating row shading and a sticky header."
    >
      <CodeBlock
        language="mdx"
        code={`<WikiExamTable
  headers={['Occupancy', 'Min Width', 'Min Height']}
  rows={[
    ['Residential', '1.10 m', '2.40 m'],
    ['Commercial', '1.50 m', '2.70 m'],
    ['Assembly', '2.00 m', '3.00 m'],
  ]}
/>`}
      />
    </ComponentCard>

    <ComponentCard
      name="WikiArticleHero"
      badge={<MdxBadge />}
      description="Article-level header with discipline badge, chapter number, title, and estimated read time. Placed at the top of each wiki article."
    >
      <CodeBlock
        language="mdx"
        code={`<WikiArticleHero
  discipline="Architecture"
  chapter="DSGN-013"
  title="Furniture & Equipment Clearances"
  readTime={12}
/>`}
      />
    </ComponentCard>

    <ComponentCard
      name="WikiPartHeader"
      badge={<MdxBadge />}
      description="Section divider within a long article. Renders a numbered part label with a thick underline accent."
    >
      <PreviewBox>
        <WikiPartHeader partNumber={1} title="Human Body Dimensions" />
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<WikiPartHeader partNumber={1} title="Human Body Dimensions" />`}
      />
    </ComponentCard>

    <ComponentCard
      name="WikiChangedPill"
      badge={<MdxBadge />}
      description="Inline indicator for provisions that changed in a recent code revision. Orange pill with amendment year."
    >
      <PreviewBox>
        <p className="text-sm text-foreground">The minimum accessible ramp gradient is 1:12 <WikiChangedPill oldValue="1:10 (2013 IRR)" />.</p>
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`The minimum accessible ramp gradient is 1:12 <WikiChangedPill oldValue="1:10 (2013 IRR)" />.`}
      />
    </ComponentCard>

    <SectionLabel>Interactive Content</SectionLabel>

    <ComponentCard
      name="KeyValues"
      badge={<MdxBadge />}
      description="Definition list for numeric standards and code thresholds. Renders key-value pairs in a compact grid."
    >
      <PreviewBox>
        <KeyValues items={[
          { label: 'Min corridor width (residential)', value: '1.10 m' },
          { label: 'Min corridor width (commercial)', value: '1.50 m' },
          { label: 'Min stair width', value: '0.90 m' },
        ]} />
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<KeyValues items={[
  { label: 'Min corridor width (residential)', value: '1.10 m' },
  { label: 'Min corridor width (commercial)', value: '1.50 m' },
  { label: 'Min stair width', value: '0.90 m' },
]} />`}
      />
    </ComponentCard>

    <ComponentCard
      name="FormulaBlock"
      badge={<MdxBadge />}
      description="Styled formula display with LaTeX support. Uses a monospace code-block style with optional variable legend."
    >
      <PreviewBox>
        <FormulaBlock label="Floor Area Ratio" steps={[
          { variable: 'FAR', operator: '=', operands: ['GFA', 'Lot Area'], symbol: '÷' },
        ]} />
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<FormulaBlock label="Floor Area Ratio" steps={[
  { variable: 'FAR', operator: '=', operands: ['GFA', 'Lot Area'], symbol: '÷' },
]} />`}
      />
    </ComponentCard>

    <ComponentCard
      name="InlineQuiz"
      badge={<MdxBadge />}
      description="Single-question practice prompt embedded in article flow. Reveals explanation on answer with correct/incorrect feedback."
    >
      <CodeBlock
        language="mdx"
        code={`<InlineQuiz
  question="What is the minimum corridor width for a commercial occupancy under the NBCP?"
  options={['0.90 m', '1.10 m', '1.50 m', '2.00 m']}
  correctIndex={2}
  explanation="Section 401 requires 1.50 m for commercial and institutional occupancies."
/>`}
      />
    </ComponentCard>

    <ComponentCard
      name="ElaborativeInterrogation"
      badge={<MdxBadge />}
      description="Pedagogical prompt that invites the reader to explain a concept before revealing the answer. Supports spaced repetition by surfacing the why."
    >
      <CodeBlock
        language="mdx"
        code={`<ElaborativeInterrogation
  prompt="Why does BP 344 require a 1.80 m turning radius for wheelchair users?"
  answer="The 1.80 m diameter circle is the minimum for a standard wheelchair to complete a 180° turn without repositioning."
/>`}
      />
    </ComponentCard>

    <ComponentCard
      name="Accordion / AccordionItem"
      badge={<MdxBadge />}
      description="Collapsible content sections. Multiple items can expand simultaneously (default) or be set to exclusive mode."
    >
      <CodeBlock
        language="mdx"
        code={`<Accordion>
  <AccordionItem title="Section 401 — Corridors">
    Minimum clear width for corridors in residential occupancies is 1.10 m.
  </AccordionItem>
  <AccordionItem title="Section 501 — Exits">
    Every storey shall have at least two means of egress.
  </AccordionItem>
</Accordion>`}
      />
    </ComponentCard>

    <ComponentCard
      name="Tabs / Tab (MDX)"
      badge={<MdxBadge />}
      description="Tabbed content sections within an article. Different from the UI Tabs component — these are prose-aware and accept MDX children."
    >
      <CodeBlock
        language="mdx"
        code={`<Tabs>
  <Tab label="Residential">
    Minimum corridor width: 1.10 m. Minimum stair width: 0.90 m.
  </Tab>
  <Tab label="Commercial">
    Minimum corridor width: 1.50 m. Minimum stair width: 1.10 m.
  </Tab>
</Tabs>`}
      />
    </ComponentCard>

    <ComponentCard
      name="ComparisonTable"
      badge={<MdxBadge />}
      description="Side-by-side comparison of two or more standards, occupancy types, or code editions."
    >
      <CodeBlock
        language="mdx"
        code={`<ComparisonTable
  columns={['BP 344 (2020)', 'NBCP (PD 1096)']}
  rows={[
    { label: 'Min door width', values: ['0.90 m', '0.80 m'] },
    { label: 'Min corridor width', values: ['1.50 m', '1.10 m'] },
  ]}
/>`}
      />
    </ComponentCard>

    <ComponentCard
      name="ProcessFlow"
      badge={<MdxBadge />}
      description="Numbered step diagram for procedures and approval sequences."
    >
      <CodeBlock
        language="mdx"
        code={`<ProcessFlow steps={[
  { label: 'Submit application', detail: 'City Building Official — 3 copies' },
  { label: 'Evaluation', detail: 'Compliance check against NBCP and local ordinances' },
  { label: 'Issuance', detail: 'Building permit released within 15 working days' },
]} />`}
      />
    </ComponentCard>

    <SectionLabel>Interactive Blocks</SectionLabel>

    {/* WikiTabs / Tab */}
    <ComponentCard
      name="Tabs / Tab"
      badge={<MdxBadge />}
      path="src/components/wiki/WikiTabs.tsx"
      description="MDX-compatible tabbed content. Parses child Tab elements by label/value props. For app UI, use the Base UI Tabs from src/components/ui/tabs.tsx instead."
    >
      <PropTable
        props={[
          { name: 'defaultTab', type: 'string', default: 'first tab value', description: 'Initially active tab value' },
        ]}
      />
      <PreviewBox>
        <WikiTabs defaultTab="overview">
          <Tab label="Overview" value="overview">
            Site analysis is the systematic study of existing conditions.
          </Tab>
          <Tab label="Key Provisions" value="provisions">
            NBCP Section 708: Minimum setback requirements.
          </Tab>
          <Tab label="Practice Tips" value="tips">
            Focus on slope classification and solar orientation.
          </Tab>
        </WikiTabs>
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<Tabs defaultTab="overview">
  <Tab label="Overview" value="overview">
    Site analysis is the systematic study of existing conditions.
  </Tab>
  <Tab label="Key Provisions" value="provisions">
    NBCP Section 708: Minimum setback requirements.
  </Tab>
  <Tab label="Practice Tips" value="tips">
    Focus on slope classification and solar orientation.
  </Tab>
</Tabs>`}
      />
    </ComponentCard>

    {/* Accordion / AccordionItem */}
    <ComponentCard
      name="Accordion / AccordionItem"
      badge={<MdxBadge />}
      path="src/components/ui/accordion.tsx"
      description="Collapsible content sections with single-open (default) or multi-open modes. Context-based: items inside an Accordion parent are coordinated; standalone AccordionItems manage their own state."
    >
      <PropTable
        props={[
          { name: 'allowMultiple', type: 'boolean', default: 'false', description: 'Allow multiple items open at once' },
          { name: 'title', type: 'string', required: true, description: 'AccordionItem header text' },
        ]}
      />
      <PreviewBox>
        <Accordion>
          <AccordionItem title="What is FAR?">
            Floor Area Ratio = Total Gross Floor Area / Total Lot Area.
          </AccordionItem>
          <AccordionItem title="How is ISA calculated?">
            Impervious Surface Area ratio limits hard surfaces on a lot.
          </AccordionItem>
          <AccordionItem title="NBCP fire setback rules">
            PD 1096 Section 708 requires minimum setbacks based on occupancy.
          </AccordionItem>
        </Accordion>
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<Accordion>
  <AccordionItem title="What is FAR?">
    Floor Area Ratio = Total Gross Floor Area / Total Lot Area.
  </AccordionItem>
  <AccordionItem title="How is ISA calculated?">
    Impervious Surface Area ratio limits hard surfaces on a lot.
  </AccordionItem>
  <AccordionItem title="NBCP fire setback rules">
    PD 1096 Section 708 requires minimum setbacks based on occupancy.
  </AccordionItem>
</Accordion>`}
      />
    </ComponentCard>

    {/* WikiMistakeCard */}
    <ComponentCard
      name="WikiMistakeCard"
      badge={<MdxBadge />}
      path="src/components/wiki/WikiMistakeCard.tsx"
      description="Error correction card showing a common student mistake vs the correct answer, with an explanation. Used inside WikiMistakeList."
    >
      <PropTable
        props={[
          { name: 'wrong', type: 'string', required: true, description: 'What students commonly write' },
          { name: 'correct', type: 'string', required: true, description: 'The correct answer' },
          { name: 'explanation', type: 'string', required: true, description: 'Why the mistake happens and how to remember correctly' },
        ]}
      />
      <PreviewBox>
        <WikiMistakeCard
          number={1}
          title="FAR Formula Reversal"
          wrongValue="FAR = Lot Area / GFA"
          correctValue="FAR = GFA / Lot Area"
          explanation="FAR measures how much floor area you get per unit of land, not the inverse."
        />
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<WikiMistakeCard
  number={1}
  title="FAR Formula Reversal"
  wrongValue="FAR = Lot Area / GFA"
  correctValue="FAR = GFA / Lot Area"
  explanation="FAR measures how much floor area you get per unit of land, not the inverse."
/>`}
      />
    </ComponentCard>

    {/* WikiMistakeList */}
    <ComponentCard
      name="WikiMistakeList"
      badge={<MdxBadge />}
      path="src/components/wiki/WikiMistakeList.tsx"
      description="Container for multiple WikiMistakeCard instances. Renders a titled section with consistent spacing."
    >
      <PreviewBox>
        <WikiMistakeList mistakes={[
          { number: 1, title: "OSPA Calculation", wrongValue: "OSPA = 70% of TLA", correctValue: "OSPA = 100% - BHL% - ISA%", explanation: "OSPA is derived from subtracting built-up and impervious areas, not a fixed percentage." },
          { number: 2, title: "Setback Measurement", wrongValue: "Setback is measured from property line to nearest wall", correctValue: "Setback is measured from property line to outermost face of building", explanation: "Projections like eaves and balconies count toward the building face." },
        ]} />
      </PreviewBox>
      <CodeBlock
        language="mdx"
        code={`<WikiMistakeList mistakes={[
  { number: 1, title: "OSPA Calculation", wrongValue: "OSPA = 70% of TLA", correctValue: "OSPA = 100% - BHL% - ISA%", explanation: "OSPA is derived from subtracting built-up and impervious areas, not a fixed percentage." },
  { number: 2, title: "Setback Measurement", wrongValue: "Setback from property line to nearest wall", correctValue: "Setback from property line to outermost face of building", explanation: "Projections like eaves and balconies count toward the building face." },
]} />`}
      />
    </ComponentCard>
  </div>
)

/* ------------------------------------------------------------------ */
/* Tab 3 — Widgets                                                     */
/* ------------------------------------------------------------------ */

const WidgetsTab = () => (
  <div className="space-y-4">
    {/* How it works */}
    <Card variant="default" size="sm" className="gap-3">
      <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
        Architecture
      </p>
      <h3 className="text-[13px] font-semibold text-foreground font-[family-name:var(--font-display)]">
        Lazy Widget System
      </h3>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Widgets are React components embedded in MDX via JSX tags. At render time,{' '}
        <code className="font-[family-name:var(--font-dm-mono)] text-[10px] text-primary bg-primary/5 px-1 rounded">detectWidgets(content)</code>{' '}
        scans the raw MDX string for known tag names, then{' '}
        <code className="font-[family-name:var(--font-dm-mono)] text-[10px] text-primary bg-primary/5 px-1 rounded">resolveWidgets(content)</code>{' '}
        dynamically imports only those modules. An article using 3 widgets loads 3 bundles — not the entire registry.
      </p>
      <CodeBlock
        filename="registry.ts — How widgets load"
        code={`// 1. Scan MDX content for widget tags (string match, no parsing)
const needed = detectWidgets(content)  // ['DoorConfigurator', 'RecallDrill']

// 2. Load only those components in parallel
const components = await resolveWidgets(content)
// { DoorConfigurator: ComponentType, RecallDrill: ComponentType }

// 3. Spread into MDX components object
<MDXRemote source={mdx} components={{ ...baseComponents, ...components }} />`}
      />
      <CodeBlock
        filename="Adding a new widget — 2 steps"
        code={`// Step 1: Create the component
// src/components/wiki/widgets/my-group/MyWidget.tsx
export const MyWidget = ({ ... }) => { ... }

// Step 2: Register it in registry.ts
MyWidget: () => import('./my-group/MyWidget').then(m => m.MyWidget),

// Done. WikiArticle.tsx needs no changes.`}
      />
    </Card>

    <SectionLabel>BP 344 — Accessibility Standards (6 widgets)</SectionLabel>

    <div className="space-y-2">
      <ComponentCard
        name="ComparisonTable"
        badge={<WidgetBadge group="BP 344" />}
        description="Side-by-side accessibility dimension table. Compares BP 344 requirements against NBCP baseline across door widths, corridor clearances, and turning radii."
      >
        <CodeBlock language="mdx" code={`<ComparisonTable />`} />
      </ComponentCard>

      <ComponentCard
        name="DoorConfigurator"
        badge={<WidgetBadge group="BP 344" />}
        description="Interactive door width configurator. User selects occupancy and door type; widget shows minimum clear width and highlights BP 344 compliance threshold."
      >
        <CodeBlock language="mdx" code={`<DoorConfigurator />`} />
      </ComponentCard>

      <ComponentCard
        name="CorridorVisualizer"
        badge={<WidgetBadge group="BP 344" />}
        description="SVG corridor diagram. Toggles between residential (1.10 m) and commercial (1.50 m) widths with a wheelchair turning circle overlay."
      >
        <CodeBlock language="mdx" code={`<CorridorVisualizer />`} />
      </ComponentCard>

      <ComponentCard
        name="CubicleChecker"
        badge={<WidgetBadge group="BP 344" />}
        description="Accessible toilet cubicle dimension checker. Validates user-entered dimensions against the 1.70 m × 1.80 m BP 344 minimum."
      >
        <CodeBlock language="mdx" code={`<CubicleChecker />`} />
      </ComponentCard>

      <ComponentCard
        name="GrabBarExplainer"
        badge={<WidgetBadge group="BP 344" />}
        description="Annotated grab bar placement diagram. Shows mounting heights, reach ranges, and the 38 mm diameter requirement from Section 7.4."
      >
        <CodeBlock language="mdx" code={`<GrabBarExplainer />`} />
      </ComponentCard>

      <ComponentCard
        name="RecallDrill"
        badge={<WidgetBadge group="BP 344" />}
        description="Flashcard-style recall drill for BP 344 numeric thresholds. Cycles through key dimensions in random order with pass/fail tracking."
      >
        <CodeBlock language="mdx" code={`<RecallDrill />`} />
      </ComponentCard>
    </div>

    <SectionLabel>DSGN-013 — Furniture & Equipment Clearances (11 widgets)</SectionLabel>

    <div className="space-y-2">
      <ComponentCard
        name="BedroomPlanView"
        badge={<WidgetBadge group="DSGN-013" />}
        description="Top-down bedroom plan diagram. Shows bed clearance zones (750 mm side, 900 mm foot) with draggable furniture for scale reference."
      >
        <CodeBlock language="mdx" code={`<BedroomPlanView />`} />
      </ComponentCard>

      <ComponentCard
        name="BedSizeComparator"
        badge={<WidgetBadge group="DSGN-013" />}
        description="Philippine standard bed sizes at 1:50 scale. Overlays single, double, queen, and king footprints side-by-side with room clearance annotations."
      >
        <CodeBlock language="mdx" code={`<BedSizeComparator />`} />
      </ComponentCard>

      <ComponentCard
        name="WorkstationCalculator"
        badge={<WidgetBadge group="DSGN-013" />}
        description="Workstation area calculator. User inputs number of workstations; widget outputs required floor area using 4.5 m² per person (BPS standard)."
      >
        <CodeBlock language="mdx" code={`<WorkstationCalculator />`} />
      </ComponentCard>

      <ComponentCard
        name="DimensionDrill"
        badge={<WidgetBadge group="DSGN-013" />}
        description="Rapid-fire recall drill for furniture clearance dimensions. Accepts typed numeric answers with ±50 mm tolerance."
      >
        <CodeBlock language="mdx" code={`<DimensionDrill />`} />
      </ComponentCard>

      <ComponentCard
        name="BodyDimensionExplorer"
        badge={<WidgetBadge group="DSGN-013" />}
        description="Interactive human figure with annotated body dimensions. Tap any measurement to see the Filipino 50th-percentile value and design implication."
      >
        <CodeBlock language="mdx" code={`<BodyDimensionExplorer />`} />
      </ComponentCard>

      <ComponentCard
        name="ReachEnvelopeDiagram"
        badge={<WidgetBadge group="DSGN-013" />}
        description="Standing and seated reach envelope overlays. Shows forward/side reach ranges used for counter height and shelf placement standards."
      >
        <CodeBlock language="mdx" code={`<ReachEnvelopeDiagram />`} />
      </ComponentCard>

      <ComponentCard
        name="BodyDimensionDrill"
        badge={<WidgetBadge group="DSGN-013" />}
        description="Drill for human body proportion dimensions. Covers eye height, elbow height, knuckle height, and reach zones."
      >
        <CodeBlock language="mdx" code={`<BodyDimensionDrill />`} />
      </ComponentCard>

      <ComponentCard
        name="DHRatioExplorer"
        badge={<WidgetBadge group="DSGN-013" />}
        description="D/H ratio spatial quality explorer. Drag the distance or height slider to visualize enclosure, exposure, and the 1:1 / 2:1 / 3:1 perception thresholds."
      >
        <CodeBlock language="mdx" code={`<DHRatioExplorer />`} />
      </ComponentCard>

      <ComponentCard
        name="ProportionComparator"
        badge={<WidgetBadge group="DSGN-013" />}
        description="Classical proportion ratios (golden section, 1:√2, Fibonacci) rendered as room cross-sections at matching floor area."
      >
        <CodeBlock language="mdx" code={`<ProportionComparator />`} />
      </ComponentCard>

      <ComponentCard
        name="SpatialQualityDrill"
        badge={<WidgetBadge group="DSGN-013" />}
        description="Recall drill for spatial quality concepts — enclosure categories, D/H thresholds, and proportion vocabulary from DSGN-013-03."
      >
        <CodeBlock language="mdx" code={`<SpatialQualityDrill />`} />
      </ComponentCard>
    </div>

    <SectionLabel>Interactive Illustrations</SectionLabel>

    <ComponentCard
      name="PHBuildingSetbacks"
      badge={<WidgetBadge group="Illustrations" />}
      description="Annotated 2D setback diagram for Philippine residential lots. Shows front, side, and rear setback zones with NBCP minimums labeled."
    >
      <CodeBlock language="mdx" code={`<PHBuildingSetbacks />`} />
    </ComponentCard>
  </div>
)

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function ComponentLibraryPage() {
  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
          Engineering Reference
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground tracking-tight">
          Component Library
        </h1>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl mt-1">
          247 components across 25 directories. Each with props interface, usage examples, and import paths.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="primitives">
        <TabsList variant="underline">
          <TabsTrigger value="primitives">UI Primitives</TabsTrigger>
          <TabsTrigger value="mdx">MDX Components</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
        </TabsList>

        <TabsContent value="primitives" className="mt-4">
          <UIPrimitivesTab />
        </TabsContent>

        <TabsContent value="mdx" className="mt-4">
          <MdxComponentsTab />
        </TabsContent>

        <TabsContent value="widgets" className="mt-4">
          <WidgetsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
