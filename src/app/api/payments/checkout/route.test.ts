import { describe, expect, mock, test } from 'bun:test'

class MockPaymentUnavailableError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'PaymentUnavailableError'
    this.code = code
  }
}

mock.module('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}))

mock.module('@/lib/payments/provider', () => ({
  PaymentUnavailableError: MockPaymentUnavailableError,
  isPaymentEnabled: () => true,
  tierFromAmount: () => 'pro',
  createCheckout: mock(() => {
    throw new MockPaymentUnavailableError(
      'PayRex is not configured.',
      'PAYMENT_PROVIDER_UNAVAILABLE',
    )
  }),
}))

mock.module('@/lib/demo/config', () => ({
  isDemoMode: () => false,
}))

mock.module('@/lib/supabase/server', () => ({
  createClient: () =>
    Promise.resolve({
      auth: {
        getUser: () =>
          Promise.resolve({
            data: {
              user: {
                id: 'user-1',
                email: 'student@example.com',
              },
            },
          }),
      },
    }),
}))

mock.module('@/lib/entitlements/get-viewer-entitlements', () => ({
  getViewerEntitlements: () =>
    Promise.resolve({
      traceId: 'trace-1',
      userId: 'user-1',
      normalizedRole: 'student',
      roleResolution: { resolvedFrom: 'profile' },
      rawTier: 'free',
      subscriptionStatus: null,
      effectiveTier: 'free',
      overrides: {},
    }),
}))

mock.module('@/lib/entitlements/audit', () => ({
  logEntitlementAuditEvent: mock(() => undefined),
  serializeOverrideState: () => ({}),
}))

const { POST } = await import('./route')

describe('payments checkout route', () => {
  test('returns 503 when the selected payment provider is unavailable', async () => {
    const response = await POST(
      new Request('http://localhost/api/payments/checkout', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ tier: 'pro' }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body).toEqual({
      error: 'Payments are temporarily unavailable',
      code: 'PAYMENT_PROVIDER_UNAVAILABLE',
    })
  })
})
