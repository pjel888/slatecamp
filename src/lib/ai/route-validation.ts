import { z } from 'zod'

/**
 * Shared validation helpers for `/api/ai/*` route handlers.
 *
 * Every AI route handler is a public, cost-bearing endpoint that calls an
 * external model provider. Two failure classes are guarded here:
 *
 *   1. **Size**: route handlers do NOT inherit the server-action 4 MB body
 *      limit, so without an explicit cap a free-tier user could POST a multi-
 *      MB JSON body and exhaust the model provider's token quota.
 *   2. **Shape**: client-supplied JSON was previously destructured without
 *      validation and stringified directly into model prompts (prompt-
 *      injection sink). Each route now parses its body with a zod schema.
 *
 * Usage:
 *   const parsed = await parseAiBody(req, MySchema)
 *   if (!parsed.ok) return parsed.response
 *   const { field } = parsed.data
 */

/** Per-request body size cap for AI routes. Generous for any legitimate use. */
const AI_ROUTE_MAX_BODY_BYTES = 100_000

export type ParseAiBodyResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response }

/**
 * Read up to {@link AI_ROUTE_MAX_BODY_BYTES} bytes from the request, parse as
 * JSON, and validate against `schema`. Returns a `Response` on any failure
 * (size, JSON parse, schema) so callers can early-return without thinking
 * about the failure modes individually.
 */
export async function parseAiBody<T>(
  req: Request,
  schema: z.ZodType<T>,
): Promise<ParseAiBodyResult<T>> {
  // Cheap pre-check: if Content-Length is present and exceeds the cap, reject
  // before reading the body. If absent (chunked transfer), the read below
  // still enforces the cap via the limit on `req.text()`.
  const contentLengthHeader = req.headers.get('content-length')
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader)
    if (Number.isFinite(contentLength) && contentLength > AI_ROUTE_MAX_BODY_BYTES) {
      return {
        ok: false,
        response: Response.json(
          { error: 'Request body too large' },
          { status: 413 },
        ),
      }
    }
  }

  let rawText: string
  try {
    rawText = await req.text()
  } catch {
    return {
      ok: false,
      response: Response.json({ error: 'Invalid request body' }, { status: 400 }),
    }
  }

  if (rawText.length > AI_ROUTE_MAX_BODY_BYTES) {
    return {
      ok: false,
      response: Response.json(
        { error: 'Request body too large' },
        { status: 413 },
      ),
    }
  }

  let json: unknown
  try {
    json = JSON.parse(rawText)
  } catch {
    return {
      ok: false,
      response: Response.json({ error: 'Invalid JSON' }, { status: 400 }),
    }
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return {
      ok: false,
      response: Response.json(
        { error: 'Invalid request', issues: parsed.error.issues },
        { status: 400 },
      ),
    }
  }

  return { ok: true, data: parsed.data }
}
