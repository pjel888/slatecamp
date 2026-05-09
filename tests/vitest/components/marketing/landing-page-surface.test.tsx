import React from 'react'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/marketing/HeroSection'
import { BentoFeatureGrid } from '@/components/marketing/BentoFeatureGrid'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection'

vi.mock('@/components/marketing/hero/AtlasFieldHero', () => ({
  AtlasAtmosphere: () => <div data-testid='atlas-atmosphere' aria-hidden='true'>Atlas atmosphere</div>,
  AtlasFieldHero: () => <div data-testid='atlas-atmosphere' aria-hidden='true'>Atlas atmosphere</div>,
}))

vi.mock('@/components/marketing/hero/HeroHousePreview', () => ({
  HeroHousePreview: () => (
    <div data-testid='hero-house-preview' role='img' aria-label='Interactive three-dimensional blank 16 by 32 meter lot model with one-meter grid and dimension guides. It rotates slowly until you drag to orbit it.' />
  ),
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
  it('caps marketing surface radii at the SlateCamp modal benchmark', () => {
    const files = [
      'src/components/marketing/HeroSection.tsx',
      'src/components/marketing/hero/HeroHousePreview.tsx',
      'src/components/marketing/FinalCtaSection.tsx',
      'src/components/marketing/AnalyticsSection.tsx',
      'src/components/marketing/ThreeDLabSection.tsx',
      'src/components/marketing/QuestionsSection.tsx',
      'src/components/marketing/ComparisonSection.tsx',
      'src/components/marketing/HowItWorksSection.tsx',
      'src/components/marketing/WikiSection.tsx',
    ]

    const oversizedRadiusPattern = /rounded-(?:xl|2xl|3xl)|rounded-\[(?:[1-9]\d+px|[1-9](?:\.\d+)?rem)\]/

    for (const file of files) {
      expect(readFileSync(join(process.cwd(), file), 'utf8'), file).not.toMatch(oversizedRadiusPattern)
    }
  })

  it('explains SlateCamp clearly for first-time Filipino architecture learners', () => {
    render(<HeroSection ctaHref='/register' ctaLabel='Open the atlas' />)

    expect(screen.getByText(/Architecture knowledge atlas/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /know you’ll win/i })).toBeInTheDocument()
    expect(screen.getByText(/SlateCamp is a supplementary architecture learning resource/i)).toBeInTheDocument()
    expect(screen.getByText(/wiki notes, code explainers, quizzes, 3D visuals, and tools/i)).toBeInTheDocument()
    expect(screen.getByText(/Use it beside your books, notes, mentors, and review materials\./i)).toBeInTheDocument()
    expect(screen.getAllByText(/Knowledge Wiki/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Practice Questions/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/3D Lab/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByLabelText(/SlateCamp atlas path index/i)).not.toBeInTheDocument()
    expect(screen.getByLabelText(/SlateCamp feature video launcher/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/SlateCamp product preview carousel/i)).not.toBeInTheDocument()
    expect(screen.getByText(/feature previews/i)).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /play .* feature video/i })).toHaveLength(4)
    const featureMotionCards = [
      'knowledge-wiki',
      'quizzes',
      'three-d-lab',
      'analytics',
    ].map((id) => screen.getByTestId(`hero-feature-card-motion-${id}`))
    expect(featureMotionCards).toHaveLength(4)
    featureMotionCards.forEach((card) => {
      expect(card).toHaveAttribute('data-motion', 'bottom-up-stagger')
    })
    expect(screen.getByRole('button', { name: /play knowledge wiki feature video/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play quizzes feature video/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play 3D Lab feature video/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play analytics feature video/i })).toBeInTheDocument()
    expect(screen.queryByText(/Slide to submit/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Spatial rule controls/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Find architecture topics/i)).not.toBeInTheDocument()
    expect(screen.queryByText('Know the next subject to review')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /play knowledge wiki feature video/i }))
    expect(screen.getByRole('dialog', { name: /Knowledge Wiki/i })).toBeInTheDocument()
    expect(screen.getByText(/Knowledge Wiki video placeholder/i)).toBeInTheDocument()
    expect(screen.getByText(/wired for playback/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /close feature video/i }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open the atlas/i })).toHaveAttribute('href', '/register')
    expect(screen.queryByRole('link', { name: /find a topic/i })).not.toBeInTheDocument()
    expect(screen.getByTestId('atlas-atmosphere')).toBeInTheDocument()
    expect(screen.getByTestId('hero-house-preview')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /blank 16 by 32 meter lot model/i })).toBeInTheDocument()
    expect(screen.queryByTestId('atlas-field-hero')).not.toBeInTheDocument()
    expect(screen.queryByText(/review center/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/source-aware/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/revisit/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/repair/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/active recall/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/SRS/i)).not.toBeInTheDocument()
  })

  it('renders indexed product paths instead of card-first feature pillars', () => {
    render(<BentoFeatureGrid />)

    expect(screen.getByRole('heading', { name: /four ways back to a clearer architecture map/i })).toBeInTheDocument()
    expect(screen.getByText('A / Find')).toBeInTheDocument()
    expect(screen.getByText('B / Check')).toBeInTheDocument()
    expect(screen.getByText('C / See')).toBeInTheDocument()
    expect(screen.getByText('D / Revisit')).toBeInTheDocument()
    expect(screen.getByText(/supplementary support/i)).toBeInTheDocument()
    expect(screen.getByText(/where account access supports it/i)).toBeInTheDocument()
  })

  it('explains the atlas workflow with assurance and repair language', () => {
    render(<HowItWorksSection />)

    expect(screen.getByText(/follow a calmer loop/i)).toBeInTheDocument()
    expect(screen.getByText('Find the confusing topic')).toBeInTheDocument()
    expect(screen.getByText('Check what stayed with you')).toBeInTheDocument()
    expect(screen.getByText('Repair the gap')).toBeInTheDocument()
    expect(screen.getByText('Return with a plan')).toBeInTheDocument()
    expect(screen.queryByText(/readiness check/i)).not.toBeInTheDocument()
  })

  it('uses fear marketing safely without pass guarantees', () => {
    render(<FinalCtaSection ctaHref='/register' ctaLabel='Open the atlas' isLoggedIn={false} />)

    expect(screen.getByRole('heading', { name: /danger is discovering them too late/i })).toBeInTheDocument()
    expect(screen.getByText(/No credit card required/i)).toBeInTheDocument()
    expect(screen.queryByText(/guarantee/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open the atlas/i })).toHaveAttribute('href', '/register')
  })
})
