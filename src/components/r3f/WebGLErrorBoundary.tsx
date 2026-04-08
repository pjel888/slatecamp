// src/components/r3f/WebGLErrorBoundary.tsx
// Dual-strategy WebGL safety boundary:
//   1. React error boundary — catches render-time errors inside the Canvas subtree
//   2. WebGL context loss event listener — handles GPU context loss events
//
// Class component is required here: React error boundaries must be class
// components. This is the ONE exception to the arrow-function-only rule.
'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  /** Optional fallback shown when context is permanently lost */
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  contextLost: boolean
  errorMessage: string | null
}

export class WebGLErrorBoundary extends React.Component<Props, State> {
  private canvasEl: HTMLCanvasElement | null = null
  private containerRef = React.createRef<HTMLDivElement>()

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      contextLost: false,
      errorMessage: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      errorMessage: error.message ?? 'Unknown render error',
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[WebGLErrorBoundary] Render error caught', {
      error: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
    })
  }

  private handleContextLost = (e: Event) => {
    e.preventDefault() // Prevent default — allows context restoration attempt
    console.warn('[WebGLErrorBoundary] WebGL context lost — GPU may have been reset')
    this.setState({ contextLost: true })
  }

  private handleContextRestored = () => {
    console.info('[WebGLErrorBoundary] WebGL context restored')
    this.setState({ contextLost: false, hasError: false, errorMessage: null })
  }

  private attachContextListeners(canvas: HTMLCanvasElement) {
    this.canvasEl = canvas
    canvas.addEventListener('webglcontextlost', this.handleContextLost)
    canvas.addEventListener('webglcontextrestored', this.handleContextRestored)
  }

  private detachContextListeners() {
    if (!this.canvasEl) return
    this.canvasEl.removeEventListener('webglcontextlost', this.handleContextLost)
    this.canvasEl.removeEventListener('webglcontextrestored', this.handleContextRestored)
    this.canvasEl = null
  }

  componentDidMount() {
    // Find the Canvas element inside our container and attach context listeners.
    // R3F renders the <canvas> element synchronously, so it is present in the DOM
    // at this point.
    const container = this.containerRef.current
    if (!container) return
    const canvas = container.querySelector('canvas')
    if (canvas) {
      this.attachContextListeners(canvas)
    }
  }

  componentDidUpdate() {
    // Re-attach if the canvas was replaced (e.g. after a hard remount via key change)
    const container = this.containerRef.current
    if (!container) return
    const canvas = container.querySelector('canvas')
    if (canvas && canvas !== this.canvasEl) {
      this.detachContextListeners()
      this.attachContextListeners(canvas)
    }
  }

  componentWillUnmount() {
    this.detachContextListeners()
  }

  private handleRetry = () => {
    this.setState({ hasError: false, contextLost: false, errorMessage: null })
  }

  render() {
    const { hasError, contextLost, errorMessage } = this.state
    const { children, fallback } = this.props

    if (hasError || contextLost) {
      if (fallback) return fallback

      return (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-3 text-center px-6">
            <div className="text-sm font-bold text-foreground">
              {contextLost ? '3D Context Lost' : '3D Render Error'}
            </div>
            <p className="text-xs text-muted-foreground max-w-xs">
              {contextLost
                ? 'The GPU context was lost. This can happen when the device is under heavy load.'
                : errorMessage ?? 'An error occurred while rendering the 3D scene.'}
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="mt-1 px-3 py-1.5 text-xs font-semibold rounded-sm bg-primary text-white hover:bg-primary-700 transition-colors duration-150"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return (
      <div ref={this.containerRef} className="contents">
        {children}
      </div>
    )
  }
}
