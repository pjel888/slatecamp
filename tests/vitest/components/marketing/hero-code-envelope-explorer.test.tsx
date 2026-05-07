import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
  Html: () => null,
}))

describe('HeroCodeEnvelopeExplorer', () => {
  it('renders a demand-rendered 3D hero canvas with accessible study copy', () => {
    render(<HeroCodeEnvelopeExplorer />)

    expect(screen.getByText('Try a setback. Watch the buildable envelope change.')).toBeInTheDocument()
    expect(screen.getByTestId('hero-r3f-canvas')).toHaveAttribute('data-frameloop', 'demand')
    expect(screen.getByText(/PD 1096 Rules VII & VIII/i)).toBeInTheDocument()
    expect(screen.getByText(/study visual/i)).toBeInTheDocument()
  })

  it('updates the eave clearance status from the rendered scene geometry', async () => {
    const user = userEvent.setup()
    render(<HeroCodeEnvelopeExplorer />)

    expect(screen.getByText(/3200 mm clear/i)).toBeInTheDocument()
    expect(screen.getByText(/Compliant study state/i)).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /R-2 rowhouse/i }))

    expect(screen.getByText(/700 mm clear/i)).toBeInTheDocument()
    expect(screen.getByText(/Too close in this study state/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /600/i }))

    expect(screen.getByText(/900 mm clear/i)).toBeInTheDocument()
    expect(screen.getByText(/Compliant study state/i)).toBeInTheDocument()
  })

  it('uses the existing site-development computation basis for buildable dimensions', async () => {
    const user = userEvent.setup()
    render(<HeroCodeEnvelopeExplorer />)

    expect(screen.getByText('16 m')).toBeInTheDocument()
    expect(screen.getByText('8.5 m')).toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: /R-2 rowhouse/i }))

    expect(screen.getByText('6 m')).toBeInTheDocument()
    expect(screen.getByText('15 m')).toBeInTheDocument()
  })
})
