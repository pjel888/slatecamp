'use client'

import { Component, type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackHeight?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class AnalyticsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      const { fallbackHeight = 'h-[200px]' } = this.props
      return (
        <Card className={`${fallbackHeight} border-border/50`}>
          <CardContent className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
            <AlertTriangle className="w-5 h-5 text-muted-foreground/60" />
            <p className="text-sm font-medium text-muted-foreground">
              This section couldn&apos;t load
            </p>
            <p className="text-xs text-muted-foreground/70 max-w-[200px]">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={this.handleRetry}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
