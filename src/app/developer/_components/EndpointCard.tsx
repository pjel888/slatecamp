'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CodeBlock } from './CodeBlock'

const methodStyles: Record<string, { variant: 'success' | 'primary' | 'warning' | 'danger' | 'purple'; label: string }> = {
  GET: { variant: 'success', label: 'GET' },
  POST: { variant: 'primary', label: 'POST' },
  PUT: { variant: 'warning', label: 'PUT' },
  DELETE: { variant: 'danger', label: 'DEL' },
  PATCH: { variant: 'purple', label: 'PATCH' },
}

interface EndpointCardProps {
  method: string
  path: string
  description: string
  auth?: string
  badges?: string[]
  requestSchema?: string
  responseExample?: string
  curlExample?: string
  className?: string
}

export const EndpointCard = ({
  method,
  path,
  description,
  auth,
  badges,
  requestSchema,
  responseExample,
  curlExample,
  className,
}: EndpointCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const style = methodStyles[method.toUpperCase()] ?? { variant: 'primary' as const, label: method }
  const hasDetails = requestSchema || responseExample || curlExample

  return (
    <div
      className={cn(
        'border border-border rounded-xs transition-colors duration-150',
        hasDetails && 'cursor-pointer hover:border-primary/20 hover:bg-primary/[0.01]',
        className,
      )}
    >
      <div
        className="flex items-start gap-2.5 px-3 py-2.5"
        onClick={() => hasDetails && setExpanded(!expanded)}
      >
        <Badge
          variant={style.variant}
          size="xs"
          className="font-[family-name:var(--font-dm-mono)] min-w-[44px] justify-center mt-0.5"
        >
          {style.label}
        </Badge>
        <div className="flex-1 min-w-0">
          <div className="font-[family-name:var(--font-dm-mono)] text-xs font-medium text-foreground">
            {path}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{description}</div>
          {auth && (
            <div className="text-[10px] text-muted-foreground mt-0.5">
              Auth: <span className="font-medium">{auth}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {badges?.map((b) => (
            <Badge key={b} variant="default" size="xs" pill className="font-[family-name:var(--font-dm-mono)]">
              {b}
            </Badge>
          ))}
          {hasDetails && (
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 text-muted-foreground transition-transform duration-150',
                expanded && 'rotate-180',
              )}
            />
          )}
        </div>
      </div>

      {expanded && hasDetails && (
        <div className="px-3 pb-3 space-y-3 border-t border-border pt-3">
          {requestSchema && (
            <div>
              <p className="text-[11px] font-semibold text-foreground mb-1">Request Body</p>
              <CodeBlock code={requestSchema} language="TypeScript" />
            </div>
          )}
          {responseExample && (
            <div>
              <p className="text-[11px] font-semibold text-foreground mb-1">Response</p>
              <CodeBlock code={responseExample} language="JSON — 200 OK" />
            </div>
          )}
          {curlExample && (
            <div>
              <p className="text-[11px] font-semibold text-foreground mb-1">Example</p>
              <CodeBlock code={curlExample} language="curl" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
