'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface UpgradeButtonsProps {
  tier?: 'camp' | 'insurance' | 'institutional'
}

export const UpgradeButtons = ({ tier = 'camp' }: UpgradeButtonsProps) => {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const handleCheckout = async (provider?: 'lemonsqueezy' | 'payrex') => {
    setLoading(provider || 'loading')
    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('Checkout failed:', data.error)
        alert('Failed to start checkout. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-sm">
      <Button
        onClick={() => handleCheckout('payrex')}
        disabled={loading !== null}
        className="w-full h-12 text-sm font-semibold"
      >
        {loading === 'payrex' ? 'Connecting to GCash...' : 'Pay with GCash / Maya'}
      </Button>
      <Button
        variant="outline"
        onClick={() => handleCheckout('lemonsqueezy')}
        disabled={loading !== null}
        className="w-full h-12 text-sm font-medium"
      >
        {loading === 'lemonsqueezy' ? 'Connecting...' : 'Pay with Card'}
      </Button>
    </div>
  )
}
