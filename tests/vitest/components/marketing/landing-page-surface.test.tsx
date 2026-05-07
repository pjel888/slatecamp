import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { HeroSection } from '@/components/marketing/HeroSection'
import { BentoFeatureGrid } from '@/components/marketing/BentoFeatureGrid'
import { HowItWorksSection } from '@/components/marketing/HowItWorksSection'
import { FinalCtaSection } from '@/components/marketing/FinalCtaSection'

vi.mock('@/components/marketing/hero/HeroCodeEnvelopeExplorer', () => ({
  HeroCodeEnvelopeExplorer: () => <div data-testid='hero-code-envelope-explorer'>3D hero explorer</div>,
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
  it('positions SlateCamp as a study companion, not a primary review center', () => {
    render(<HeroSection ctaHref='/register' ctaLabel='Start Your Free Readiness Score' />)

    expect(screen.getByRole('heading', { name: /your architecture study companion/i })).toBeInTheDocument()
    expect(screen.getByText(/reliable buddy that makes the hard parts visible/i)).toBeInTheDocument()
    expect(screen.getByText(/beside your review center, school, books, and mentors/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start your free readiness score/i })).toHaveAttribute('href', '/register')
    expect(screen.getByTestId('hero-code-envelope-explorer')).toBeInTheDocument()
  })

  it('renders the four acquisition pillars in language students care about', () => {
    render(<BentoFeatureGrid />)

    expect(screen.getByRole('heading', { name: /field guide, quiz buddy, 3d lab, and toolbelt/i })).toBeInTheDocument()
    expect(screen.getByText('Knowledge Resources')).toBeInTheDocument()
    expect(screen.getByText('Quizzes')).toBeInTheDocument()
    expect(screen.getByText('3D Lab')).toBeInTheDocument()
    expect(screen.getByText('Free Tools')).toBeInTheDocument()
    expect(screen.getByText(/Stop hunting through scattered PDFs/i)).toBeInTheDocument()
    expect(screen.getByText(/Know what stuck after lecture/i)).toBeInTheDocument()
  })

  it('explains the reviewer-buddy workflow with assurance and repair language', () => {
    render(<HowItWorksSection />)

    expect(screen.getByText(/always-available reviewer buddy beside your real review system/i)).toBeInTheDocument()
    expect(screen.getByText('Find the confusing topic')).toBeInTheDocument()
    expect(screen.getByText('Check what stayed with you')).toBeInTheDocument()
    expect(screen.getByText('Repair the gap')).toBeInTheDocument()
    expect(screen.getByText('Return with a plan')).toBeInTheDocument()
  })

  it('uses fear marketing safely without pass guarantees', () => {
    render(<FinalCtaSection ctaHref='/register' ctaLabel='Start free' isLoggedIn={false} />)

    expect(screen.getByRole('heading', { name: /danger is discovering them too late/i })).toBeInTheDocument()
    expect(screen.getByText(/No card required/i)).toBeInTheDocument()
    expect(screen.queryByText(/guarantee/i)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start free/i })).toHaveAttribute('href', '/register')
  })
})
