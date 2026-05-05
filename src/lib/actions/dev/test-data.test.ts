/// <reference types="bun-types" />
import { describe, test, expect, mock } from 'bun:test'

mock.module('server-only', () => ({}))

// Mutable mock state so tests can change behavior without re-mocking the module
let developerAccessAllowed = true
let orgInsertResult: any = {
  data: { org_id: 'org-1', name: 'Test University' },
  error: null,
}

mock.module('@/lib/developer/access', () => ({
  assertDeveloperAccess: () => {
    if (!developerAccessAllowed) {
      throw new Error('Not authorized to access developer tools')
    }
    return Promise.resolve()
  },
}))

mock.module('@/lib/logging/server', () => ({
  logServerEvent: () => Promise.resolve(),
}))

mock.module('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: (table: string) => {
      if (table === 'organizations') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve(orgInsertResult),
            }),
          }),
        }
      }
      if (table === 'org_members') {
        return {
          insert: () => Promise.resolve({ error: null }),
        }
      }
      return {
        insert: () => Promise.resolve({ error: null }),
      }
    },
  }),
  getUser: () => Promise.resolve({ data: { user: { id: 'user-1' } }, error: null }),
}))

const { generateTestSessions, generateTestOrg } = await import('./test-data')

describe('generateTestSessions', () => {
  test('rejects when developer access is denied', async () => {
    developerAccessAllowed = false
    await expect(generateTestSessions(5)).rejects.toThrow('Not authorized to access developer tools')
    developerAccessAllowed = true
  })

  test('quarantines stale test-session generation', async () => {
    const result = await generateTestSessions(200)
    expect(result.message).toContain('disabled')
    expect(result.message).toContain('current quiz_sessions/taxonomy schema')
  })

  test('does not query stale exam/profile tables', async () => {
    const result = await generateTestSessions(5)
    expect(result.message).toContain('disabled')
  })
})

describe('generateTestOrg', () => {
  test('rejects when developer access is denied', async () => {
    developerAccessAllowed = false
    await expect(generateTestOrg()).rejects.toThrow('Not authorized to access developer tools')
    developerAccessAllowed = true
  })

  test('creates organization successfully', async () => {
    orgInsertResult = {
      data: { org_id: 'org-1', name: 'Test University' },
      error: null,
    }
    const result = await generateTestOrg()
    expect(result.message).toContain('Created organization')
  })
})
