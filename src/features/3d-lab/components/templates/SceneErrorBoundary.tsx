// src/features/3d-lab/components/templates/SceneErrorBoundary.tsx
// React error boundary for 3D scene render errors.
// Class component — required by React error boundary API.

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  remountKey: number
}

export class SceneErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, remountKey: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      remountKey: prev.remountKey + 1,
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-card p-6">
          <div className="w-full max-w-sm rounded-md border border-border p-5 text-center">
            <p className="mb-1 text-sm font-semibold text-foreground">
              Scene failed to render
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              {this.state.error?.message ?? 'An unexpected error occurred in the 3D scene.'}
            </p>
            <button
              onClick={this.handleRetry}
              className="rounded-sm bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-primary-700"
            >
              Retry
            </button>
          </div>
        </div>
      )
    }

    return <div key={this.state.remountKey} className="h-full w-full">{this.props.children}</div>
  }
}
