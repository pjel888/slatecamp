import { beforeEach, describe, expect, mock, test } from 'bun:test'

const auditRangeMock = mock(() =>
  Promise.resolve({
    data: [
      {
        id: 'audit-1',
        actor_id: 'user-1',
        event_type: 'UPDATE',
        table_name: 'wiki_articles',
        record_id: 'article-1',
        metadata: {},
        content_snapshot: {},
        created_at: '2026-04-12T08:00:00Z',
      },
    ],
    error: null,
  }),
)

const wikiArticlesLimitMock = mock(() =>
  Promise.resolve({
    data: [
      {
        article_id: 'article-1',
        title: 'Article',
        slug: 'article',
        status: 'draft',
        created_at: '2026-04-12T07:00:00Z',
        updated_at: '2026-04-12T08:00:00Z',
      },
    ],
  }),
)

mock.module('@/lib/supabase/server', () => ({
  createStaticClient: () => Promise.resolve({}),
  hasAuthCookie: () => Promise.resolve(false),
  getUserIfPresent: () => Promise.resolve({ data: { user: null } }),
  createServiceClient: () =>
    Promise.resolve({
      from: (table: string) => {
        if (table === 'audit_logs') {
          return {
            select: mock(() => ({
              order: mock(() => ({
                eq: mock(() => ({
                  range: auditRangeMock,
                })),
                range: auditRangeMock,
              })),
            })),
          }
        }

        if (table === 'wiki_articles') {
          return {
            select: mock(() => ({
              order: mock(() => ({
                limit: wikiArticlesLimitMock,
              })),
            })),
          }
        }

        return {
          select: mock(() => ({
            order: mock(() => ({
              limit: mock(() => Promise.resolve({ data: [] })),
            })),
          })),
        }
      },
    }),
}))

mock.module('@/lib/admin/roles', () => ({
  isSuperAdmin: mock(() => Promise.resolve(true)),
  assertPermission: mock(() => Promise.resolve()),
}))

const { getAuditLogs } = await import('./audit-queries')

describe('audit query fallback', () => {
  beforeEach(() => {
    auditRangeMock.mockReset()
    wikiArticlesLimitMock.mockReset()

    auditRangeMock.mockResolvedValue({
      data: [
        {
          id: 'audit-1',
          actor_id: 'user-1',
          event_type: 'UPDATE',
          table_name: 'wiki_articles',
          record_id: 'article-1',
          metadata: {},
          content_snapshot: {},
          created_at: '2026-04-12T08:00:00Z',
        },
      ],
      error: null,
    })

    wikiArticlesLimitMock.mockResolvedValue({
      data: [
        {
          article_id: 'article-1',
          title: 'Article',
          slug: 'article',
          status: 'draft',
          created_at: '2026-04-12T07:00:00Z',
          updated_at: '2026-04-12T08:00:00Z',
        },
      ],
    })
  })

  test('returns real audit rows when audit_logs is available', async () => {
    const result = await getAuditLogs({ limit: 10 })
    expect(result[0]?.table_name).toBe('wiki_articles')
    expect(result[0]?.id).toBe('audit-1')
  })

  test('falls back to synthesized rows when audit_logs is missing from schema cache', async () => {
    auditRangeMock.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST205', message: 'missing audit_logs' },
    })

    const result = await getAuditLogs({ limit: 10 })
    expect(result[0]?.table_name).toBe('wiki_articles')
    expect(result[0]?.metadata?.fallback).toBe(true)
  })
})
