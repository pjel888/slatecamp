import { expect, vi, afterEach } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'

expect.extend(matchers)

afterEach(() => {
  cleanup()
})

/* ------------------------------------------------------------------ */
/* jsdom environment mocks                                            */
/* ------------------------------------------------------------------ */

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
})

// next-themes reads localStorage for theme persistence
class FakeStorage implements Storage {
  private store: Record<string, string> = {}

  get length() {
    return Object.keys(this.store).length
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null
  }

  setItem(key: string, value: string): void {
    this.store[key] = value
  }

  removeItem(key: string): void {
    delete this.store[key]
  }

  clear(): void {
    this.store = {}
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new FakeStorage(),
})

Object.defineProperty(window, 'sessionStorage', {
  value: new FakeStorage(),
})
