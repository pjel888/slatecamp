import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { HeroCodeEnvelopeExplorer } from '@/components/marketing/hero/HeroCodeEnvelopeExplorer'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ frameloop }: { children: React.ReactNode; frameloop?: string }) => (
    <div data-testid='hero-r3f-canvas' data-frameloop={frameloop} />
  ),
  useThree: () => ({ invalidate: vi.fn(), gl: { setClearColor: vi.fn() } }),
}))

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => null,
  PerspectiveCamera: () => null,
  Line: () => null,
  Edges: () => null,
}))

describe('HeroCodeEnvelopeExplorer', () => {
  it('renders a demand-rendered floating 3D hero canvas with accessible study copy', () => {
    render(<HeroCodeEnvelopeExplorer />)

    expect(screen.getByText('Widen the house. See when the lot stops working.')).toBeInTheDocument()
    expect(screen.getByTestId('hero-r3f-canvas')).toHaveAttribute('data-frameloop', 'demand')
    expect(screen.getByText(/Building width/i)).toBeInTheDocument()
    expect(screen.getByText(/Educational preview only/i)).toBeInTheDocument()
  })

  it('uses exactly one landing-page control for the hero interaction', () => {
    render(<HeroCodeEnvelopeExplorer />)

    expect(screen.getAllByRole('slider')).toHaveLength(1)
    expect(screen.getByRole('slider', { name: /building width/i })).toBeInTheDocument()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /show setbacks/i })).not.toBeInTheDocument()
  })

  it('shows the simple width story: safe, setback violation, then lot-line violation', () => {
    render(<HeroCodeEnvelopeExplorer />)

    const slider = screen.getByRole('slider', { name: /building width/i })

    expect(screen.getByText(/Inside the buildable area/i)).toBeInTheDocument()
    expect(screen.getByText(/Buildable width 16 m/i)).toBeInTheDocument()

    fireEvent.change(slider, { target: { value: '17' } })

    expect(screen.getByText(/Crossing the setback/i)).toBeInTheDocument()
    expect(screen.getByText(/crossing the side setback line/i)).toBeInTheDocument()

    fireEvent.change(slider, { target: { value: '21' } })

    expect(screen.getByText(/Beyond lot line/i)).toBeInTheDocument()
    expect(screen.getByText(/wider than the sample lot/i)).toBeInTheDocument()
  })
})
