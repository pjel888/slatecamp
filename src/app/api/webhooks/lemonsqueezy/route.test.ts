import { beforeEach, describe, expect, mock, test } from 'bun:test'

type LemonSqueezyWebhookEventMock = {
  id: string
  type: string
  data: {
    object: Record<string, unknown>
  }
}

const constructEventMock = mock((): LemonSqueezyWebhookEventMock => ({
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
const upsertMock = mock(() => Promise.resolve({ error: null }))
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
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
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
          upsert: upsertMock,
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
    upsertMock.mockClear()
    upsertMock.mockResolvedValue({ error: null })
    updateEqMock.mockClear()
    updateEqMock.mockResolvedValue({ error: null })
    insertMock.mockClear()
    insertMock.mockResolvedValue({ error: null })
    logServerErrorMock.mockClear()
    logServerEventMock.mockClear()
  })

  test('upserts subscription before marking a successful checkout event processed', async () => {
    const response = await POST(new Request('http://localhost/api/webhooks/lemonsqueezy', { method: 'POST', body: '{}' }))
    const body = await response.json()

    expect(body.received).toBe(true)
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        tier: 'pro',
        lemonsqueezy_customer_id: 'customer-1',
        lemonsqueezy_subscription_id: 'subscription-1',
        status: 'active',
      }),
      { onConflict: 'user_id' },
    )
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'lemonsqueezy',
        event_id: 'evt-1',
        event_type: 'checkout.session.completed',
      }),
    )
  })

  test('logs replayed events and returns idempotent response', async () => {
    maybeSingleMock.mockResolvedValue({ data: { id: 'existing' } })

    const response = await POST(new Request('http://localhost/api/webhooks/lemonsqueezy', { method: 'POST', body: '{}' }))
    const body = await response.json()

    expect(body.idempotent).toBe(true)
    expect(logServerEventMock).toHaveBeenCalledTimes(1)
  })

  test('does not mark subscription cancellation processed when downgrade fails', async () => {
    constructEventMock.mockReturnValue({
      id: 'evt-cancel-1',
      type: 'customer.subscription.deleted',
      data: {
        object: {
          id: 'subscription-1',
        },
      },
    })
    updateEqMock.mockResolvedValue({ error: new Error('downgrade failed') })

    const response = await POST(new Request('http://localhost/api/webhooks/lemonsqueezy', { method: 'POST', body: '{}' }))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Subscription cancellation failed')
    expect(insertMock).not.toHaveBeenCalled()
    expect(logServerErrorMock).toHaveBeenCalledTimes(1)
  })
})
