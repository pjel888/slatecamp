export const isProductionRuntime = () => process.env.NODE_ENV === 'production'

const isEnabled = (value: string | undefined) => value === 'true' || value === '1'

export const isDevPortalBypassAllowed = () =>
  !isProductionRuntime() && isEnabled(process.env.ALLOW_DEV_PORTAL_BYPASS)

export const isDevForceUserAllowed = () =>
  !isProductionRuntime() &&
  process.env.DISABLE_DEV_FORCE_USER_ID !== 'true' &&
  Boolean(process.env.DEV_FORCE_USER_ID)

export const getUnsafeProductionEnvFlags = () => {
  if (!isProductionRuntime()) return []

  const unsafeFlags: string[] = []
  if (process.env.DEV_FORCE_USER_ID) unsafeFlags.push('DEV_FORCE_USER_ID')
  if (isEnabled(process.env.ALLOW_DEV_PORTAL_BYPASS)) {
    unsafeFlags.push('ALLOW_DEV_PORTAL_BYPASS')
  }
  if (process.env.DEV_FORCE_TIER) unsafeFlags.push('DEV_FORCE_TIER')

  return unsafeFlags
}

export const assertSafeProductionEnv = () => {
  const unsafeFlags = getUnsafeProductionEnvFlags()
  if (unsafeFlags.length > 0) {
    throw new Error(
      `Unsafe production environment configuration: ${unsafeFlags.join(', ')}`,
    )
  }
}
