const wait = async (delayMs: number) => {
  if (delayMs <= 0) {
    return
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs))
}

export const createResolvedAction = <TArgs extends unknown[], TResult>(
  result: TResult,
  delayMs = 0,
) => {
  return async (..._args: TArgs) => {
    await wait(delayMs)
    return result
  }
}

export const createRejectedAction = <TArgs extends unknown[]>(
  error: Error | string,
  delayMs = 0,
) => {
  return async (..._args: TArgs) => {
    await wait(delayMs)
    throw typeof error === 'string' ? new Error(error) : error
  }
}
