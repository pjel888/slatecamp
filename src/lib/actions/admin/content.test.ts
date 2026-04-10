import { beforeEach, describe, expect, mock, test } from 'bun:test'

// Mock dependencies
const mockUpdate = mock(() => ({ eq: () => Promise.resolve({ error: null }) }))
const mockDelete = mock(() => ({ eq: () => Promise.resolve({ error: null }) }))
const mockInsert = mock(() => Promise.resolve({ error: null }))

const mockSupabase = {
  from: (table: string) => {
    if (table === 'wiki_articles') return { update: mockUpdate }
    if (table === 'wiki_article_taxonomy') return { delete: mockDelete, insert: mockInsert }
    return {} as any
  }
}

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => mockSupabase,
}))

const mockCanManageContent = mock(() => Promise.resolve(true))
mock.module('@/lib/admin/roles', () => ({
  canManageContent: mockCanManageContent,
}))

const mockRevalidateTag = mock(() => {})
const mockRevalidatePath = mock(() => {})
mock.module('next/cache', () => ({
  revalidateTag: mockRevalidateTag,
  revalidatePath: mockRevalidatePath,
}))

// Re-import to use mocked modules
const { updateArticleFull } = await import('./content')

describe('Admin Content Actions', () => {
  beforeEach(() => {
    mockUpdate.mockClear()
    mockDelete.mockClear()
    mockInsert.mockClear()
    mockCanManageContent.mockClear()
    mockRevalidateTag.mockClear()
    mockRevalidatePath.mockClear()
  })

  describe('updateArticleFull', () => {
    test('successfully updates article and revalidates', async () => {
      const result = await updateArticleFull('art-1', {
        title: 'New Title',
        content: 'New Content',
      })

      expect(result.error).toBeNull()
      expect(mockUpdate).toHaveBeenCalled()
      expect(mockRevalidateTag).toHaveBeenCalledWith('wiki', 'max')
      expect(mockRevalidatePath).toHaveBeenCalled()
    })

    test('updates taxonomy mapping when node_id is provided', async () => {
      const result = await updateArticleFull('art-1', {
        node_id: 'node-1',
      })

      expect(result.error).toBeNull()
      expect(mockDelete).toHaveBeenCalled()
      expect(mockInsert).toHaveBeenCalledWith({
        article_id: 'art-1',
        node_id: 'node-1',
        is_primary: true
      })
    })

    test('removes taxonomy mapping when node_id is null', async () => {
      const result = await updateArticleFull('art-1', {
        node_id: null,
      })

      expect(result.error).toBeNull()
      expect(mockDelete).toHaveBeenCalled()
      expect(mockInsert).not.toHaveBeenCalled()
    })

    test('throws error if not authorized', async () => {
      mockCanManageContent.mockResolvedValue(false)
      
      expect(updateArticleFull('art-1', {})).rejects.toThrow('Unauthorized')
    })
  })
})
