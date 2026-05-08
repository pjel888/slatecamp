import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/marketing/HeroSection'
import { BentoFeatureGrid } from '@/components/marketing/BentoFeatureGrid'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection'

vi.mock('@/components/marketing/hero/AtlasFieldHero', () => ({
  AtlasAtmosphere: () => <div data-testid='atlas-atmosphere' aria-hidden='true'>Atlas atmosphere</div>,
  AtlasFieldHero: () => <div data-testid='atlas-atmosphere' aria-hidden='true'>Atlas atmosphere</div>,
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
  it('positions SlateCamp as a Board 2-led architecture knowledge atlas', () => {
    render(<HeroSection ctaHref='/register' ctaLabel='Open the atlas' />)

    expect(screen.getByText(/architecture knowledge atlas/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /find where it fits\. know what to revisit/i })).toBeInTheDocument()
    expect(screen.getByText(/scattered review feels like a map again/i)).toBeInTheDocument()
    expect(screen.getByText(/use beside school, books, mentors, notes, review materials, and self-study/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /open the atlas/i })).toHaveAttribute('href', '/register')
    expect(screen.getByRole('link', { name: /find a topic/i })).toHaveAttribute('href', '/dashboard/wiki')
    expect(screen.getByTestId('atlas-atmosphere')).toBeInTheDocument()
    expect(screen.queryByTestId('atlas-field-hero')).not.toBeInTheDocument()
    expect(screen.queryByText(/review center/i)).not.toBeInTheDocument()
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
