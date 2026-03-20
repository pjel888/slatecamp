'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

interface WikiNavigationContextValue {
  isPending: boolean
  navigate: (href: string) => void
}

const WikiNavigationContext = React.createContext<WikiNavigationContextValue>({
  isPending: false,
  navigate: () => {},
})

export const useWikiNavigation = () => React.useContext(WikiNavigationContext)

export const WikiNavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()

  const navigate = React.useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href)
      })
    },
    [router, startTransition],
  )

  const value = React.useMemo(() => ({ isPending, navigate }), [isPending, navigate])

  return (
    <WikiNavigationContext.Provider value={value}>
      {children}
    </WikiNavigationContext.Provider>
  )
}
