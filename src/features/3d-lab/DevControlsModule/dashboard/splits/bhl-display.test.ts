import { describe, expect, test } from 'bun:test'
import { buildBhlControlDisplay } from './bhl-display'

describe('buildBhlControlDisplay', () => {
  test('uses the live floor height for the meter display', () => {
    const display = buildBhlControlDisplay({
      currentBhlStoreys: 5,
      computedBhlStoreys: 5,
      floorHeight: 3.5,
      isCustom: false,
    })

    expect(display.value).toBe(5)
    expect(display.formattedValue).toBe('5F / 17.5m')
    expect(display.label).toBe('BHL (Computed)')
    expect(display.isViolating).toBe(false)
  })

  test('keeps the current BHL storey value when a custom override is active', () => {
    const display = buildBhlControlDisplay({
      currentBhlStoreys: 10,
      computedBhlStoreys: 5,
      floorHeight: 2.8,
      isCustom: true,
    })

    expect(display.value).toBe(10)
    expect(display.formattedValue).toBe('10F / 28.0m')
    expect(display.contextLine).toBe('Computed: 5F')
    expect(display.resetLabel).toBe('Reset to computed (5F)')
    expect(display.isViolating).toBe(true)
  })
})
