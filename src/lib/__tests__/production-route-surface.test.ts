import { describe, expect, test } from 'bun:test'
import { existsSync } from 'node:fs'
import path from 'node:path'

const appRoot = path.join(process.cwd(), 'src/app')

const removedDiagnosticRoutes = [
  'debug-supabase',
  'debug-cache-bypass',
  'debug-check',
  'debug-mdx',
  'debug-mdx-detailed',
  'test-media',
]

describe('production route surface', () => {
  test('does not include removed debug/test page routes', () => {
    for (const route of removedDiagnosticRoutes) {
      expect(existsSync(path.join(appRoot, route, 'page.tsx'))).toBe(false)
    }
  })
})
