import type { WikiPage } from "@/types/app";

export type PageStub = Pick<WikiPage, 'id' | 'title' | 'slug' | 'is_deprecated'> & { order_index: number }

export function findAdjacentPages(
  pages: PageStub[],
  currentId: string
): { prev: PageStub | null; next: PageStub | null } {
  const sorted = [...pages].sort((a, b) => a.order_index - b.order_index)
  const idx = sorted.findIndex((p) => p.id === currentId)
  if (idx === -1) return { prev: null, next: null }
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  }
}
