'use client'

import { useState, useEffect } from 'react'
import { CHART_COLORS } from '@/lib/constants/chart-colors'

export type ChartColors = {
  [K in keyof typeof CHART_COLORS]: string
}

/**
 * Resolves CSS custom properties to hex values for Recharts SVG rendering.
 *
 * Recharts renders to SVG — SVG `fill`/`stroke` attributes do NOT resolve
 * `var(--token)` CSS variables. This hook reads computed styles from the
 * document root and returns resolved hex values.
 *
 * Falls back to static CHART_COLORS constants for SSR / initial render.
 * Re-resolves when the component mounts (handles dark mode and theme changes).
 */
export const useChartColors = (): ChartColors => {
  const [colors, setColors] = useState<ChartColors>(CHART_COLORS)

  useEffect(() => {
    const root = document.documentElement
    const computed = getComputedStyle(root)

    const resolve = (varName: string, fallback: string): string => {
      const value = computed.getPropertyValue(varName).trim()
      // CSS custom properties may return oklch/hsl values — for now, prefer
      // the static fallback if the resolved value is empty or non-hex.
      if (!value || !value.startsWith('#')) return fallback
      return value
    }

    setColors({
      primary: resolve('--primary', CHART_COLORS.primary),
      primaryLight: resolve('--primary-50', CHART_COLORS.primaryLight),
      success: resolve('--success', CHART_COLORS.success),
      destructive: resolve('--destructive', CHART_COLORS.destructive),
      warning: resolve('--warning', CHART_COLORS.warning),
      border: resolve('--border', CHART_COLORS.border),
      textSecondary: resolve('--text-secondary', CHART_COLORS.textSecondary),
      mutedForeground: resolve('--muted-foreground', CHART_COLORS.mutedForeground),
      foreground: resolve('--foreground', CHART_COLORS.foreground),
      background: resolve('--background', CHART_COLORS.background),
      // Chart-specific aliases always use static values
      gridStroke: CHART_COLORS.gridStroke,
      referenceLine: CHART_COLORS.referenceLine,
      tooltipBorder: CHART_COLORS.tooltipBorder,
      axisTickFill: CHART_COLORS.axisTickFill,
      quadrantFallback: CHART_COLORS.quadrantFallback,
      modeFallback: CHART_COLORS.modeFallback,
    })
  }, [])

  return colors
}
