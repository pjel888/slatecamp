import { useEffect, type ReactNode } from 'react'
import type { Decorator } from '@storybook/react'
import { useTheme } from 'next-themes'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/toaster'
import { NoiseFilter } from '@/components/graphics/ui/NoiseFilter'
import { NoteContextProvider } from '@/lib/context/note-context'
import {
  StorybookRouterProvider,
  type StorybookRouterConfig,
} from '@/storybook/mocks/next-navigation'

interface StorybookAppShellParameters extends StorybookRouterConfig {
  withNoiseFilter?: boolean
  withToaster?: boolean
}

const StorybookThemeSync = ({ theme }: { theme: string }) => {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme(theme)
  }, [setTheme, theme])

  return null
}

const StorybookProviders = ({
  children,
  theme,
  appShell,
}: {
  children: ReactNode
  theme: string
  appShell: StorybookAppShellParameters
}) => (
  <StorybookRouterProvider
    pathname={appShell.pathname}
    search={appShell.search}
  >
    <ThemeProvider>
      <StorybookThemeSync theme={theme} />
      {appShell.withNoiseFilter ? <NoiseFilter /> : null}
      <NoteContextProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background font-sans text-foreground">
            {children}
          </div>
          {appShell.withToaster ? <Toaster /> : null}
        </TooltipProvider>
      </NoteContextProvider>
    </ThemeProvider>
  </StorybookRouterProvider>
)

export const withAppProviders: Decorator = (Story, context) => {
  const appShell = (context.parameters.appShell ?? {}) as StorybookAppShellParameters
  const theme = typeof context.globals.theme === 'string' ? context.globals.theme : 'light'

  return (
    <StorybookProviders
      theme={theme}
      appShell={{
        pathname: appShell.pathname ?? '/storybook',
        search: appShell.search ?? '',
        withNoiseFilter: appShell.withNoiseFilter ?? false,
        withToaster: appShell.withToaster ?? false,
      }}
    >
      <Story />
    </StorybookProviders>
  )
}
