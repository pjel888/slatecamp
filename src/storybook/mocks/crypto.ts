/**
 * Storybook mock for Node 'crypto' module.
 * Vite externalizes Node built-ins but named exports aren't available
 * on the external stub. This provides browser-safe no-ops for all
 * crypto functions imported across the SlateCamp codebase.
 */
export function randomBytes(size: number): Buffer {
  return Buffer.alloc(size)
}

export function randomUUID(): string {
  return '00000000-0000-4000-8000-000000000000'
}

export function createHash(_algorithm: string) {
  return {
    update: (_data: string) => ({ digest: () => '' }),
    digest: () => '',
  }
}

export function createHmac(_algorithm: string, _key: string | Buffer) {
  return {
    update: (_data: string) => ({ digest: () => '' }),
    digest: () => '',
  }
}
