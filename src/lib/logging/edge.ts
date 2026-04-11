import { buildApplicationLogEvent, logApplicationEventToConsole } from './shared'
import type { ApplicationLogEvent, ApplicationLogEventInput } from './types'

export const logEdgeEvent = (
  input: ApplicationLogEventInput,
): ApplicationLogEvent => {
  const event = buildApplicationLogEvent({
    ...input,
    persist: false,
  })

  logApplicationEventToConsole(event)
  return event
}

export const logEdgeError = (
  input: Omit<ApplicationLogEventInput, 'severity'>,
): ApplicationLogEvent =>
  logEdgeEvent({
    ...input,
    severity: 'error',
  })
