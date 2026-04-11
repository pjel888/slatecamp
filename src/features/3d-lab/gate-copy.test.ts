import { describe, expect, test } from 'bun:test'

import { THREE_D_LAB_GATE_COPY } from './gate-copy'

describe('3d lab gate copy', () => {
  test('uses canonical paid-tier wording', () => {
    expect(THREE_D_LAB_GATE_COPY.description).toContain('Pro')
    expect(THREE_D_LAB_GATE_COPY.description).toContain('Prime')
    expect(THREE_D_LAB_GATE_COPY.description).not.toContain('Camp')
    expect(THREE_D_LAB_GATE_COPY.description).not.toContain('Insurance')
  })

  test('keeps CTA aligned with the minimum required tier', () => {
    expect(THREE_D_LAB_GATE_COPY.ctaLabel).toBe('Upgrade to Pro')
    expect(THREE_D_LAB_GATE_COPY.lockedCtaLabel).toBe('Upgrade to Pro')
  })
})
