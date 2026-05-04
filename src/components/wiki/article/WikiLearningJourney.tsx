import Link from 'next/link'
import { ArrowRight, CheckCircle, Compass, GraduationCap, Lightbulb, Target } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import type { TocHeading } from '@/lib/wiki-markdown'

interface RelatedTopic {
  slug: string
  article_id?: string
  title: string
}

export interface WikiLearningJourneyProps {
  title: string
  subject: string
  difficulty: string
  readTime: string
  whyItMatters?: string | null
  nodeName?: string | null
  headings: TocHeading[]
  relatedTopics?: RelatedTopic[]
  isMinimal?: boolean
}

const MAX_VISIBLE_STEPS = 6

const buildOutcomeText = (title: string, nodeName?: string | null) => {
  const topic = nodeName || title
  return [
    `Orient yourself around ${topic} before details compete for attention.`,
    'Trace the article section-by-section so rules, examples, and exceptions stay connected.',
    'Pause at checkpoints and explain the idea in your own words before practicing.',
  ]
}

const buildCheckpointText = (heading?: TocHeading) => {
  if (!heading) {
    return 'Before moving on, name the main problem this topic helps you solve in practice.'
  }
  return `Before moving on, explain what “${heading.text}” helps you decide or recognize.`
}

export function WikiLearningJourney({
  title,
  subject,
  difficulty,
  readTime,
  whyItMatters,
  nodeName,
  headings,
  relatedTopics = [],
  isMinimal = false,
}: WikiLearningJourneyProps) {
  if (isMinimal) return null

  const visibleSteps = headings.slice(0, MAX_VISIBLE_STEPS)
  const outcomes = buildOutcomeText(title, nodeName)
  const firstCheckpoint = buildCheckpointText(headings[0])
  const hasMoreSteps = headings.length > visibleSteps.length
  const cappedRelated = relatedTopics.filter((topic) => topic.slug).slice(0, 3)

  return (
    <section
      aria-labelledby="wiki-learning-journey-title"
      className="not-prose mt-8 rounded-lg border border-camp-cobalt/15 bg-gradient-to-br from-cobalt-light via-background to-background p-4 shadow-sm dark:from-primary/10 dark:via-background dark:to-background sm:p-5"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[3px] bg-camp-cobalt px-2 py-1 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-white">
              <GraduationCap size={13} weight="fill" aria-hidden="true" />
              Guided learning module
            </span>
            <span className="rounded-[3px] border border-border bg-background/80 px-2 py-1 font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {subject}
            </span>
            <span className="rounded-[3px] border border-border bg-background/80 px-2 py-1 font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {difficulty} · {readTime}
            </span>
          </div>

          <div className="space-y-2">
            <h2
              id="wiki-learning-journey-title"
              className="font-[var(--font-display)] text-xl font-extrabold leading-tight text-wiki-ink dark:text-wiki-invert-heading"
            >
              Start with the learning path
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-wiki-body dark:text-wiki-invert-body">
              This page keeps the full article intact, then adds orientation, checkpoints, and next steps so you can study it like an LEA training module.
            </p>
          </div>

          {whyItMatters ? (
            <div className="rounded-md border border-border bg-background/85 p-3">
              <p className="mb-1 flex items-center gap-1.5 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-camp-cobalt">
                <Target size={13} weight="fill" aria-hidden="true" />
                Why this matters
              </p>
              <p className="text-sm leading-relaxed text-wiki-body dark:text-wiki-invert-body">{whyItMatters}</p>
            </div>
          ) : null}

          <div>
            <p className="mb-2 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              You’ll practice doing this
            </p>
            <ul className="grid gap-2 sm:grid-cols-3">
              {outcomes.map((outcome) => (
                <li key={outcome} className="flex gap-2 rounded-md border border-border bg-background/85 p-3 text-xs leading-relaxed text-wiki-body dark:text-wiki-invert-body">
                  <CheckCircle size={15} weight="fill" className="mt-0.5 shrink-0 text-success-600" aria-hidden="true" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="w-full rounded-md border border-border bg-background/90 p-3 lg:w-[280px]" aria-label="Article learning map">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              <Compass size={13} weight="fill" aria-hidden="true" />
              Learning map
            </p>
            <span className="text-xs text-muted-foreground">{headings.length || 1} step{headings.length === 1 ? '' : 's'}</span>
          </div>

          {visibleSteps.length > 0 ? (
            <ol className="space-y-1.5">
              {visibleSteps.map((heading, index) => (
                <li key={`${heading.id}-${index}`}>
                  <a
                    href={`#${heading.id}`}
                    className={cn(
                      'group flex items-start gap-2 rounded-sm px-2 py-1.5 text-xs leading-snug transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      heading.level === 3 && 'ml-3',
                    )}
                  >
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-cobalt-light font-[var(--font-dm-mono)] text-[9px] font-bold text-camp-cobalt group-hover:bg-camp-cobalt group-hover:text-white">
                      {index + 1}
                    </span>
                    <span className="text-foreground group-hover:text-camp-cobalt">{heading.text}</span>
                  </a>
                </li>
              ))}
              {hasMoreSteps ? (
                <li className="px-2 pt-1 text-[11px] text-muted-foreground">+ {headings.length - visibleSteps.length} more sections in the article</li>
              ) : null}
            </ol>
          ) : (
            <p className="rounded-sm bg-muted/40 px-2 py-2 text-xs leading-relaxed text-muted-foreground">
              This article has no section headings yet, so read it as one focused lesson and use the checkpoint below before practicing.
            </p>
          )}

          <div className="mt-4 rounded-sm border border-primary/15 bg-primary/5 p-3">
            <p className="mb-1 flex items-center gap-1.5 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-camp-cobalt">
              <Lightbulb size={13} weight="fill" aria-hidden="true" />
              First checkpoint
            </p>
            <p className="text-xs leading-relaxed text-wiki-body dark:text-wiki-invert-body">{firstCheckpoint}</p>
          </div>

          {cappedRelated.length > 0 ? (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-2 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Nearby topics
              </p>
              <ul className="space-y-1">
                {cappedRelated.map((topic) => (
                  <li key={topic.slug}>
                    <Link
                      href={`/dashboard/wiki/${topic.article_id || topic.slug}`}
                      className="flex items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-camp-cobalt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>{topic.title}</span>
                      <ArrowRight size={12} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

export function WikiLearningCompletion({
  title,
  headings,
  nodeName,
}: {
  title: string
  headings: TocHeading[]
  nodeName?: string | null
}) {
  const reviewTargets = headings.filter((heading) => heading.level === 2).slice(0, 4)
  const topic = nodeName || title

  return (
    <section className="not-prose mt-12 rounded-lg border border-border bg-card p-5 shadow-sm" aria-labelledby="wiki-learning-complete-title">
      <p className="mb-2 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-success-700">
        Learning checkpoint
      </p>
      <h2 id="wiki-learning-complete-title" className="font-[var(--font-display)] text-xl font-extrabold text-wiki-ink dark:text-wiki-invert-heading">
        Before you leave this article
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-wiki-body dark:text-wiki-invert-body">
        Don’t close with a shortcut. Use these prompts to test whether the full article became usable knowledge.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-border bg-background p-3">
          <p className="mb-1 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Explain</p>
          <p className="text-sm leading-relaxed text-wiki-body dark:text-wiki-invert-body">Explain {topic} aloud without looking at the first paragraph.</p>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <p className="mb-1 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Apply</p>
          <p className="text-sm leading-relaxed text-wiki-body dark:text-wiki-invert-body">Find one rule, example, or exception in the article and state when you would use it.</p>
        </div>
        <div className="rounded-md border border-border bg-background p-3">
          <p className="mb-1 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Practice</p>
          <p className="text-sm leading-relaxed text-wiki-body dark:text-wiki-invert-body">Use the article practice button to check recall while this topic is still fresh.</p>
        </div>
      </div>

      {reviewTargets.length > 0 ? (
        <div className="mt-4 rounded-md border border-primary/15 bg-primary/5 p-4">
          <p className="mb-2 font-[var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.14em] text-camp-cobalt">
            Questions to revisit
          </p>
          <ul className="space-y-2 text-sm leading-relaxed text-wiki-body dark:text-wiki-invert-body">
            {reviewTargets.map((heading) => (
              <li key={heading.id} className="flex gap-2">
                <span className="text-camp-cobalt" aria-hidden="true">•</span>
                <span>Can you explain how “{heading.text}” changes what you would do next?</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
