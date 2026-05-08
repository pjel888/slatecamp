import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/marketing/HeroSection'
import { BentoFeatureGrid } from '@/components/marketing/BentoFeatureGrid'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection'

vi.mock('@/components/marketing/hero/AtlasFieldHero', () => ({
  AtlasFieldHero: () => <div data-testid='atlas-field-hero'>Atlas Field hero</div>,
}))

vi.mock('@/components/motion/ScrollReveal', () => ({
  ScrollReveal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@/components/motion/StaggerChildren', () => ({
  StaggerParent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  StaggerItem: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('landing page marketing surface', () => {
  it('positions SlateCamp as an architecture knowledge atlas', () => {
    render(<HeroSection ctaHref='/register' ctaLabel='Start exploring free' />)

    expect(screen.getByText(/architecture knowledge atlas/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /navigate architecture knowledge with confidence/i })).toBeInTheDocument()
    expect(screen.getByText(/source-backed resources, visual explanations, quizzes, 3d labs, and practical tools/i)).toBeInTheDocument()
    expect(screen.getByText(/browse the topic map, jump into source-backed guides/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start exploring free/i })).toHaveAttribute('href', '/register')
    expect(screen.getByTestId('atlas-field-hero')).toBeInTheDocument()
    expect(screen.queryByText(/review center/i)).not.toBeInTheDocument()
  })

  it('renders the four acquisition pillars in language students care about', () => {
    render(<BentoFeatureGrid />)

    expect(screen.getByRole('heading', { name: /field guide, quiz surface, 3d lab, and practical toolbelt/i })).toBeInTheDocument()
    expect(screen.getByText('Knowledge Resources')).toBeInTheDocument()
    expect(screen.getByText('Quizzes')).toBeInTheDocument()
    expect(screen.getByText('3D Lab')).toBeInTheDocument()
    expect(screen.getByText('Free Tools')).toBeInTheDocument()
    expect(screen.getByText(/Start from a map/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Check what stuck/i).length).toBeGreaterThan(0)
  })

  it('explains the atlas workflow with assurance and repair language', () => {
    render(<HowItWorksSection />)

    expect(screen.getByText(/follow a calmer loop/i)).toBeInTheDocument()
    expect(screen.getByText('Find the confusing topic')).toBeInTheDocument()
    expect(screen.getByText('Check what stayed with you')).toBeInTheDocument()
    expect(screen.getByText('Repair the gap')).toBeInTheDocument()
    expect(screen.getByText('Return with a plan')).toBeInTheDocument()
  })

  it('uses fear marketing safely without pass guarantees', () => {
    render(<FinalCtaSection ctaHref='/register' ctaLabel='Start exploring free' isLoggedIn={false} />)

    expect(screen.getByRole('heading', { name: /danger is discovering them too late/i })).toBeInTheDocument()
    expect(screen.getByText(/No card required/i)).toBeInTheDocument()
    expect(screen.queryByText(/guarantee/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start exploring free/i })).toHaveAttribute('href', '/register')
  })
})
