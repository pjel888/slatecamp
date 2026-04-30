'use client'

import Link from 'next/link'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import {
  Globe,
  Cube,
  FileText,
  Exam,
  ArrowRight,
} from '@phosphor-icons/react'

interface StudioCard {
  title: string
  description: string
  href: string
  icon: PhosphorIcon
  cta: string
}

const STUDIO_CARDS: StudioCard[] = [
  {
    title: 'Code Reference',
    description: 'Browse building codes, standards, and technical references organized by topic.',
    href: '/dashboard/wiki',
    icon: Globe,
    cta: 'Browse references',
  },
  {
    title: '3D Lab',
    description: 'Explore spatial relationships and architectural concepts in three dimensions.',
    href: '/dashboard/3d-lab',
    icon: Cube,
    cta: 'Open 3D Lab',
  },
  {
    title: 'Notes',
    description: 'Your personal workspace for project notes, sketches, and quick references.',
    href: '/dashboard/notes',
    icon: FileText,
    cta: 'Open notes',
  },
  {
    title: 'Quiz',
    description: 'Choose topics and answer targeted questions.',
    href: '/quiz',
    icon: Exam,
    cta: 'Start quiz',
  },
]

interface StudioHubProps {
  userName: string
}

export const StudioHub = ({ userName: _userName }: StudioHubProps) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold text-foreground">
          Studio Mode
        </h1>
        <p className="text-sm text-muted-foreground">
          Your code reference library for design projects.
        </p>
      </div>

      {/* Card grid — 2×2 desktop, single column mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STUDIO_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col gap-3 rounded-md border border-border bg-card p-5 shadow-none transition-shadow duration-150 ease-out hover:shadow-sm"
            >
              {/* Icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary-50">
                <Icon size={18} weight="regular" className="text-primary" />
              </div>

              {/* Text */}
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-sm font-semibold text-foreground">
                  {card.title}
                </span>
                <span className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </span>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-1 text-xs font-medium text-primary mt-auto">
                <span>{card.cta}</span>
                <ArrowRight
                  size={12}
                  weight="bold"
                  className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
                />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
