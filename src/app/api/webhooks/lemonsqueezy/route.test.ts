import { beforeEach, describe, expect, mock, test } from 'bun:test'

const constructEventMock = mock(() => ({
  id: 'evt-1',
  type: 'checkout.session.completed',
  data: {
    object: {
      customer: 'customer-1',
      subscription: 'subscription-1',
      metadata: {
        tier: 'pro',
        userId: 'user-1',
      },
    },
  },
}))

const maybeSingleMock = mock(() => Promise.resolve({ data: null }))
const updateEqMock = mock(() => Promise.resolve({ error: null }))
const insertMock = mock(() => Promise.resolve({ error: null }))

mock.module('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) => (name === 'x-signature' ? 'sig' : null),
    }),
}))

mock.module('next/server', () => ({
  NextResponse: {
    json: (body: unknown) => ({
      json: async () => body,
    }),
  },
  after: (fn: () => unknown) => fn(),
}))

mock.module('@/lib/lemonsqueezy/config', () => ({
  getLemonSqueezy: () => ({
    webhooks: {
      constructEvent: constructEventMock,
    },
  }),
}))

mock.module('@/lib/constants/feature-flags', () => ({
  FEATURE_PAYMENTS_ENABLED: true,
}))

mock.module('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: (table: string) => {
      if (table === 'processed_webhook_events') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                maybeSingle: maybeSingleMock,
              }),
            }),
          }),
          insert: insertMock,
        }
      }

      if (table === 'user_subscriptions') {
        return {
          update: () => ({
            eq: updateEqMock,
          }),
        }
      }

      if (table === 'analytics_events') {
        return {
          insert: mock(() => Promise.resolve({ error: null })),
        }
      }

      return {} as never
    },
  }),
}))

const logServerErrorMock = mock(() => Promise.resolve())
const logServerEventMock = mock(() => Promise.resolve())
mock.module('@/lib/logging/server', () => ({
  logServerError: logServerErrorMock,
  logServerEvent: logServerEventMock,
}))

const { POST } = await import('./route')

describe('lemonsqueezy webhook route', () => {
  beforeEach(() => {
    constructEventMock.mockClear()
    maybeSingleMock.mockResolvedValue({ data: null })
    updateEqMock.mockResolvedValue({ error: null })
    insertMock.mockResolvedValue({ error: null })
    logServerErrorMock.mockClear()
    logServerEventMock.mockClear()
  })

  test('logs replayed events and returns idempotent response', async () => {
    maybeSingleMock.mockResolvedValue({ data: { id: 'existing' } })

    const response = await POST(new Request('http://localhost/api/webhooks/lemonsqueezy', { method: 'POST', body: '{}' }))
    const body = await response.json()

    expect(body.idempotent).toBe(true)
    expect(logServerEventMock).toHaveBeenCalledTimes(1)
  })
})
