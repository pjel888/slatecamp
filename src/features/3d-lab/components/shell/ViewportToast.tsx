'use client'

// ViewportToast — non-blocking warning toast for viewport errors
// Auto-dismiss after 5s. Bottom-right position.

import { useState, useEffect, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'warning' | 'error' | 'info'
}

// Simple global toast emitter
let toastListener: ((toast: Toast) => void) | null = null

export const showViewportToast = (message: string, type: 'warning' | 'error' | 'info' = 'warning') => {
  toastListener?.({ id: `toast-${Date.now()}`, message, type })
}

const TYPE_STYLES: Record<string, string> = {
  warning: 'border-warning/30 bg-warning/10 text-warning',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  info: 'border-primary/30 bg-primary/10 text-primary',
}

export const ViewportToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast])
    // Auto-dismiss after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id))
    }, 5000)
  }, [])

  useEffect(() => {
    toastListener = addToast
    return () => { toastListener = null }
  }, [addToast])

  if (toasts.length === 0) return null

  return (
    <div className="absolute bottom-4 right-4 z-40 flex flex-col gap-2 pointer-events-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-md border px-3 py-2 text-xs font-medium shadow-md ${TYPE_STYLES[toast.type] ?? TYPE_STYLES.warning}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
