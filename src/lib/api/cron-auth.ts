export type CronAuthFailureStatus = 401 | 500

export interface CronAuthFailure {
  ok: false
  response: Response
  status: CronAuthFailureStatus
}

export interface CronAuthSuccess {
  ok: true
}

export type CronAuthResult = CronAuthSuccess | CronAuthFailure

const getConfiguredCronSecret = (overrideSecret?: string | null) => {
  const secretSource = overrideSecret === undefined ? process.env.CRON_SECRET : overrideSecret
  const secret = secretSource?.trim()
  return secret && secret.length > 0 ? secret : null
}

export const verifyCronRequest = (
  authHeader: string | null,
  configuredSecret?: string | null,
): CronAuthResult => {
  const secret = getConfiguredCronSecret(configuredSecret)

  if (!secret) {
    return {
      ok: false,
      status: 500,
      response: Response.json(
        { error: 'Cron authentication is not configured' },
        { status: 500 },
      ),
    }
  }

  const expectedHeader = `Bearer ${secret}`
  if (!authHeader || authHeader !== expectedHeader) {
    return {
      ok: false,
      status: 401,
      response: Response.json({ error: 'Unauthorized' }, { status: 401 }),
    }
  }

  return { ok: true }
}
