'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export interface StorybookRouterConfig {
  pathname?: string
  search?: string
}

interface StorybookRouterContextValue {
  pathname: string
  search: string
  push: (href: string) => void
  replace: (href: string) => void
  refresh: () => void
}

const StorybookRouterContext = createContext<StorybookRouterContextValue | null>(
  null,
)

const parseHref = (href: string) => {
  const url = new URL(href, 'http://storybook.local')

  return {
    pathname: url.pathname,
    search: url.search,
  }
}

const syncBrowserLocation = (href: string, replace = false) => {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(href, window.location.origin)

  if (replace) {
    window.history.replaceState({}, '', url)
    return
  }

  window.history.pushState({}, '', url)
}

export const StorybookRouterProvider = ({
  children,
  pathname = '/storybook',
  search = '',
}: StorybookRouterConfig & { children: ReactNode }) => {
  const [location, setLocation] = useState(() => ({
    pathname,
    search,
  }))

  const navigate = useCallback((href: string, replace = false) => {
    const nextLocation = parseHref(href)

    syncBrowserLocation(href, replace)
    setLocation(nextLocation)
  }, [])

  const refresh = useCallback(() => {
    setLocation((current) => ({ ...current }))
  }, [])

  const value = useMemo<StorybookRouterContextValue>(
    () => ({
      pathname: location.pathname,
      search: location.search,
      push: (href: string) => navigate(href, false),
      replace: (href: string) => navigate(href, true),
      refresh,
    }),
    [location.pathname, location.search, navigate, refresh],
  )

  return (
    <StorybookRouterContext.Provider value={value}>
      {children}
    </StorybookRouterContext.Provider>
  )
}

const useStorybookRouterContext = () => {
  const value = useContext(StorybookRouterContext)

  if (!value) {
    throw new Error(
      'Storybook next/navigation mocks require StorybookRouterProvider in the preview decorators.',
    )
  }

  return value
}

export const usePathname = () => useStorybookRouterContext().pathname

export const useRouter = () => {
  const router = useStorybookRouterContext()

  return useMemo(
    () => ({
      push: router.push,
      replace: router.replace,
      refresh: router.refresh,
      back: () => window.history.back(),
      forward: () => window.history.forward(),
      prefetch: async (_href: string) => undefined,
    }),
    [router],
  )
}

export const useSearchParams = () => {
  const { search } = useStorybookRouterContext()

  return useMemo(() => new URLSearchParams(search), [search])
}

export const useParams = () => ({})

export const useSelectedLayoutSegment = () => null

export const useSelectedLayoutSegments = () => []

export const redirect = (href: string): never => {
  throw new Error(
    `Storybook mock redirect("${href}") was called. Use a fixture-driven adapter instead of importing a redirecting page.`,
  )
}

export const permanentRedirect = (href: string): never => {
  throw new Error(
    `Storybook mock permanentRedirect("${href}") was called. Use a fixture-driven adapter instead of importing a redirecting page.`,
  )
}

export const notFound = (): never => {
  throw new Error(
    'Storybook mock notFound() was called. Use a fixture-driven adapter instead of importing a route that depends on app runtime.',
  )
}
