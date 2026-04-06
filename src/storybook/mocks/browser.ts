let clipboardText = ''

class StorybookIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = [0]

  disconnect() {}

  observe(_target: Element) {}

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  unobserve(_target: Element) {}
}

class StorybookResizeObserver implements ResizeObserver {
  disconnect() {}

  observe(_target: Element, _options?: ResizeObserverOptions) {}

  unobserve(_target: Element) {}
}

export const installStorybookBrowserMocks = () => {
  if (typeof window === 'undefined') {
    return
  }

  if (!navigator.clipboard) {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (value: string) => {
          clipboardText = value
        },
        readText: async () => clipboardText,
      },
    })
  }

  if (!window.IntersectionObserver) {
    window.IntersectionObserver = StorybookIntersectionObserver
    globalThis.IntersectionObserver = StorybookIntersectionObserver
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = StorybookResizeObserver
    globalThis.ResizeObserver = StorybookResizeObserver
  }

  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList
  }
}
