/**
 * withMinimumDuration: Ensures a promise takes at least `minMs` to resolve.
 * Useful for preventing UI "flicker" on extremely fast server actions.
 */
export async function withMinimumDuration<T>(
  promise: Promise<T>,
  minMs: number = 600
): Promise<T> {
  const [result] = await Promise.all([
    promise,
    new Promise((resolve) => setTimeout(resolve, minMs)),
  ])
  return result
}
