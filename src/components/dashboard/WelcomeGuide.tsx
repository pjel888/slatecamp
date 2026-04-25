'use client'

import { Rocket, BookOpen, Target, ArrowRight, Circle } from '@phosphor-icons/react'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'

const WELCOME_STEPS = [
  {
    id: 'diagnostic',
    title: 'Baseline Diagnostic',
    description: 'Answer 20 mixed subjects to calibrate your initial score.',
    icon: Rocket,
    href: ROUTES.dashboard.assessment,
    cta: 'Start Diagnostic',
    color: 'bg-primary/10 text-primary',
  },
  {
    id: 'wiki',
    title: 'Explore Syllabus',
    description: 'Browse the 102 LEA topics and building codes.',
    icon: BookOpen,
    href: ROUTES.wiki.root,
    cta: 'Browse Wiki',
    color: 'bg-success/10 text-success',
  },
  {
    id: 'trails',
    title: 'Start a Trail',
    description: 'Follow a curated study schedule for your exam date.',
    icon: Target,
    href: ROUTES.dashboard.camptrails,
    cta: 'View Trails',
    color: 'bg-warning/10 text-warning',
  },
]

const ACTIVATION_CHECKLIST = [
  'Finish your baseline diagnostic',
  'Review your first Readiness Score insight',
  'Start the trail SlateCamp recommends next',
] as const

export const WelcomeGuide = ({ userName }: { userName: string }) => {
  return (
    <div className="w-full space-y-4 mb-2 animate-in fade-in slide-in-from-top-4 duration-1000">
      <div className="flex flex-col gap-4 p-6 rounded-md border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">
                Welcome to SlateCamp, {userName}!
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                You haven&apos;t taken a session yet. Build your first Readiness Score, then start a focused trail.
              </p>
            </div>

            <ol className="grid gap-2 text-left sm:grid-cols-3">
              {ACTIVATION_CHECKLIST.map((item, index) => (
                <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-primary" weight="bold" />
                  <span>
                    <span className="font-semibold text-foreground">{index + 1}.</span> {item}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-2 shrink-0 justify-center">
            <Link
              href={ROUTES.dashboard.assessment}
              className="inline-flex items-center justify-center rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              Start First Session
              <ArrowRight className="ml-2 h-4 w-4" weight="bold" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {WELCOME_STEPS.map((step) => (
          <Link
            key={step.id}
            href={step.href}
            className="group flex flex-col p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-primary/[0.02] transition-all duration-200"
          >
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-sm mb-3 transition-transform group-hover:scale-110", step.color)}>
              <step.icon size={20} weight="duotone" />
            </div>
            <h3 className="font-bold text-sm text-foreground mb-1 group-hover:text-primary transition-colors">
              {step.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">
              {step.description}
            </p>
            <div className="mt-3 flex items-center text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {step.cta}
              <ArrowRight className="ml-1 h-3 w-3" weight="bold" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
