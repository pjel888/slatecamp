/// <reference types="bun-types" />
import { describe, test, expect, mock } from 'bun:test'

mock.module('server-only', () => ({}))

mock.module('@/lib/developer/access', () => ({
  assertDeveloperAccess: () => Promise.resolve(),
}))

// Mutable mock state so tests can change behavior without re-mocking the module
let mockRpcResult: any = {
  data: [
    { table_name: 'profiles', row_count: 100, rls_enabled: true },
    { table_name: 'questions', row_count: 500, rls_enabled: true },
  ],
  error: null,
}
let mockSelectResult: any = { count: 0, error: null }

mock.module('@/lib/supabase/server', () => ({
  createClient: () => ({
    rpc: () => Promise.resolve(mockRpcResult),
    from: () => ({
      select: () => Promise.resolve(mockSelectResult),
    }),
  }),
}))

const { getTableInfo } = await import('./db-viewer')

describe('getTableInfo', () => {
  test('returns table info from RPC', async () => {
    const tables = await getTableInfo()
    expect(tables).toHaveLength(2)
    expect(tables[0]?.table_name).toBe('profiles')
    expect(tables[0]?.row_count).toBe(100)
    expect(tables[0]?.rls_enabled).toBe(true)
  })

  test('falls back to known tables when RPC fails', async () => {
    mockRpcResult = { data: null, error: { message: 'RPC not found' } }
    mockSelectResult = { count: 0, error: null }

    const tables = await getTableInfo()
    expect(tables.length).toBeGreaterThan(0)
    expect(tables.every(t => typeof t.table_name === 'string')).toBe(true)
    expect(tables[0]?.row_count).toBe(0)
  })
})
