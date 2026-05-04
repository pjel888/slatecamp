import React from 'react'
import { render as rtlRender, type RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/shared/ThemeProvider'

function AllProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}

/**
 * Render a React element wrapped with the app's standard providers.
 *
 * Use this for components that depend on ThemeProvider, TooltipProvider,
 * or other global context. For pure presentational components, plain
 * @testing-library/react render() is fine.
 */
export function render(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from RTL so consumers can import from one place
export * from '@testing-library/react'
