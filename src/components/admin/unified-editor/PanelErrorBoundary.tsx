'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  panelName: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class PanelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning-50 mb-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 6v4m0 4h.01M10 18a8 8 0 100-16 8 8 0 000 16z" stroke="#D4951A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-sm font-medium text-text-primary mb-1">
            {this.props.panelName} panel encountered an error.
          </p>
          <p className="text-xs text-text-secondary mb-3">
            Other panels are still functional.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="rounded-sm border border-border bg-white px-3 py-1.5 text-xs font-medium text-text-primary hover:bg-surface-light transition-colors duration-150"
          >
            Reload {this.props.panelName.toLowerCase()} panel
          </button>
          {this.state.error && (
            <pre className="mt-3 max-w-full overflow-auto rounded-sm bg-surface-light p-2 text-[11px] font-mono text-destructive">
              {this.state.error.message}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}
