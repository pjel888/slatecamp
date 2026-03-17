'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Input } from '@/components/ui/input'

export function WikiSearchBar() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    startTransition(() => {
      router.push(`/dashboard/wiki?q=${encodeURIComponent(trimmed)}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <SCIcon icon={MagnifyingGlass} size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search wiki..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 h-9 text-[13px] focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
        disabled={isPending}
      />
    </form>
  )
}
