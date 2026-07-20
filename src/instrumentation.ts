/**
 * Next.js instrumentation hook — runs once when the Next.js server is initialized.
 *
 * Used here to enforce that dev-override env vars are not set in production.
 * If `DEV_FORCE_USER_ID`, `ALLOW_DEV_PORTAL_BYPASS`, or `DEV_FORCE_TIER` is set
 * while `NODE_ENV=production`, the server boot aborts with a clear error —
 * preventing a misconfigured production deployment from silently activating
 * the service-role Supabase client (which bypasses RLS).
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation
 */
export async function register() {
  // Only run in the Node.js runtime. The Edge runtime has different
  // `process.env` semantics and the guardrail module is not Edge-safe.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertSafeProductionEnv } = await import('./lib/env/production-guardrails')
    assertSafeProductionEnv()
  }
}
