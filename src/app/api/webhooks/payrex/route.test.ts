import { beforeEach, describe, expect, mock, test } from 'bun:test'

const parseEventMock = mock(() =>
  Promise.resolve({
    id: 'evt-1',
    type: 'payment_intent.succeeded',
    data: {
      resource: {
        amount: 1200,
        metadata: {
          user_id: 'user-1',
          tier: 'pro',
        },
      },
    },
  }),
)

const maybeSingleMock = mock(() => Promise.resolve({ data: null }))
const upsertMock = mock(() => Promise.resolve({ error: null }))
const insertMock = mock(() => Promise.resolve({ error: null }))

mock.module('next/headers', () => ({
  headers: () =>
    Promise.resolve({
      get: (name: string) => (name === 'payrex-signature' ? 'sig' : null),
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

mock.module('@/lib/payrex/config', () => ({
  getPayRex: () => ({
    webhooks: {
      parseEvent: parseEventMock,
    },
  }),
}))

mock.module('@/lib/constants/feature-flags', () => ({
  FEATURE_PAYMENTS_ENABLED: true,
}))

mock.module('@/lib/payments/provider', () => ({
  tierFromAmount: () => 'pro',
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
          upsert: upsertMock,
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

describe('payrex webhook route', () => {
  beforeEach(() => {
    parseEventMock.mockClear()
    maybeSingleMock.mockResolvedValue({ data: null })
    upsertMock.mockResolvedValue({ error: null })
    insertMock.mockResolvedValue({ error: null })
    logServerErrorMock.mockClear()
    logServerEventMock.mockClear()
  })

  test('upserts subscription before marking a successful payment event processed', async () => {
    const response = await POST(new Request('http://localhost/api/webhooks/payrex', { method: 'POST', body: '{}' }))
    const body = await response.json()

    expect(body.received).toBe(true)
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        tier: 'pro',
        status: 'active',
        payrex_reference: 'evt-1',
      }),
      { onConflict: 'user_id' },
    )
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'payrex',
        event_id: 'evt-1',
        event_type: 'payment_intent.succeeded',
      }),
    )
  })

  test('logs replayed events and returns idempotent response', async () => {
    maybeSingleMock.mockResolvedValue({ data: { id: 'existing' } })

    const response = await POST(new Request('http://localhost/api/webhooks/payrex', { method: 'POST', body: '{}' }))
    const body = await response.json()

    expect(body.idempotent).toBe(true)
    expect(logServerEventMock).toHaveBeenCalledTimes(1)
  })
})
