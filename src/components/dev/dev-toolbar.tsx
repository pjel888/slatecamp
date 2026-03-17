'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wrench,
  ChevronDown,
  ChevronUp,
  X,
  ExternalLink,
  Zap,
  Box,
  Brain,
  RefreshCcw,
  Wifi,
  WifiOff,
  Terminal,
} from 'lucide-react'
import { useDraggableFloatingPosition } from '@/lib/hooks/useDraggableFloatingPosition'
import { useDevStore } from '@/stores/dev-store'
import type { UserTier } from '@/types/app'
import type { FeatureFlags } from '@/lib/admin/feature-flags'
import type { DevConnectionState } from '@/lib/dev/dev-mode'

const DEFAULT_RIGHT = 16
const DEFAULT_BOTTOM = 16

interface DevToolbarProps {
  connectionState: DevConnectionState
  currentTier: UserTier
  effectiveTier: UserTier
  flags: FeatureFlags
}

const TIER_CONFIG: Record<UserTier, { label: string; color: string }> = {
  free: { label: 'Free', color: 'bg-zinc-500' },
  camp: { label: 'Camp', color: 'bg-blue-500' },
  insurance: { label: 'Insurance', color: 'bg-indigo-500' },
  institutional: { label: 'Institutional', color: 'bg-amber-500' },
}

const CONN_CONFIG: Record<
  DevConnectionState,
  { label: string; color: string; icon: typeof Wifi }
> = {
  local: { label: 'Local', color: 'text-purple-500', icon: WifiOff },
  connected: { label: 'Connected', color: 'text-emerald-500', icon: Wifi },
}

export function DevToolbar({
  connectionState,
  currentTier,
  effectiveTier: initialEffective,
  flags: initialFlags,
}: DevToolbarProps) {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [effectiveTier, setEffectiveTier] = useState(initialEffective)
  const [flags, setFlags] = useState(initialFlags)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const isLocal = connectionState === 'local'

  useEffect(() => {
    setEffectiveTier(initialEffective)
    setFlags(initialFlags)
  }, [initialEffective, initialFlags])

  const persist = useCallback(
    async (newFlags: FeatureFlags) => {
      setSaving(true)
      try {
        await fetch('/api/admin/flags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newFlags),
        })
        router.refresh()
      } finally {
        setSaving(false)
      }
    },
    [router],
  )

  function switchTier(tier: UserTier) {
    const next: FeatureFlags = {
      ...flags,
      simulatedTier: tier,
      spoofedTier: tier, // backward compat
    }
    setFlags(next)
    setEffectiveTier(tier)
    persist(next)
  }

  function toggleGate(gate: 'bypass3dGate' | 'bypassAiGate' | 'bypassSrsGate') {
    const next: FeatureFlags = { ...flags, [gate]: !flags[gate] }
    setFlags(next)
    persist(next)
  }

  async function resetAll() {
    await fetch('/api/admin/flags', { method: 'DELETE' })
    setFlags({
      simulatedTier: null,
      bypass3dGate: isLocal,
      bypassAiGate: isLocal,
      bypassSrsGate: isLocal,
    })
    setEffectiveTier(isLocal ? 'institutional' : currentTier)
    router.refresh()
  }

  const isImpersonating = useDevStore((s) => s.isImpersonating)
  const activePresetId = useDevStore((s) => s.activePresetId)

  // Guard against DB subscription_tier values not in TIER_CONFIG (e.g. 'pro', 'enterprise')
  const tierConfig = TIER_CONFIG[effectiveTier] ?? TIER_CONFIG.free
  const connConfig = CONN_CONFIG[connectionState]
  const ConnIcon = connConfig.icon
  const {
    style: floatStyle,
    onPointerDown: onDrag,
    didDragRef,
  } = useDraggableFloatingPosition('dev-toolbar', DEFAULT_RIGHT, DEFAULT_BOTTOM)

  if (hidden) {
    return (
      <button
        type='button'
        onClick={() => setHidden(false)}
        style={floatStyle}
        onPointerDown={onDrag}
        className='z-9999 flex h-8 w-8 cursor-grab active:cursor-grabbing items-center justify-center rounded-full border border-border bg-background/95 shadow-lg backdrop-blur-sm transition-colors hover:bg-muted select-none'
        title='Show dev toolbar (drag to move)'
      >
        <Wrench className='h-3.5 w-3.5 text-muted-foreground' />
      </button>
    )
  }

  return (
    <div style={floatStyle} className='z-9999 select-none'>
      {/* Collapsed pill */}
      {!open && (
        <button
          type='button'
          onClick={() => {
            if (didDragRef.current) {
              didDragRef.current = false
              return
            }
            setOpen(true)
          }}
          onPointerDown={onDrag}
          className='cursor-grab active:cursor-grabbing flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl'
        >
          <Wrench className='h-3.5 w-3.5 text-muted-foreground' />
          <ConnIcon className={`h-3 w-3 ${connConfig.color}`} />
          <span
            className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wider text-white ${tierConfig.color}`}
          >
            {tierConfig.label}
          </span>
          {isImpersonating && activePresetId && (
            <span className='inline-flex items-center rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-500'>
              {activePresetId.replace(/_/g, ' ')}
            </span>
          )}
          <ChevronUp className='h-3 w-3 text-muted-foreground' />
        </button>
      )}

      {/* Expanded panel */}
      {open && (
        <div className='absolute bottom-full right-0 mb-2 w-72 overflow-hidden rounded-xl border border-border bg-background/95 shadow-2xl backdrop-blur-sm'>
          {/* Header */}
          <div className='flex items-center justify-between border-b border-border px-3 py-2'>
            <div className='flex items-center gap-2'>
              <Wrench className='h-3.5 w-3.5 text-muted-foreground' />
              <span className='text-xs font-semibold text-foreground'>
                Developer Mode
              </span>
              {saving && (
                <span className='text-[10px] text-muted-foreground animate-pulse'>
                  saving...
                </span>
              )}
            </div>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setOpen(false)}
                className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                title='Collapse'
              >
                <ChevronDown className='h-3.5 w-3.5' />
              </button>
              <button
                onClick={() => {
                  setOpen(false)
                  setHidden(true)
                }}
                className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
                title='Hide toolbar'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            </div>
          </div>

          {/* Connection State (read-only) */}
          <div className='border-b border-border px-3 py-2.5'>
            <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
              Connection
            </span>
            <p className='mt-1 flex items-center gap-1.5 text-[11px]'>
              <ConnIcon className={`h-3 w-3 ${connConfig.color}`} />
              <span className='font-medium'>{connConfig.label}</span>
              <span className='text-muted-foreground'>
                — {isLocal ? 'mock data' : 'live Supabase'}
              </span>
            </p>
          </div>

          {/* Tier Switcher */}
          <div className='border-b border-border px-3 py-2.5'>
            <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
              Tier
            </span>
            <div className='mt-1.5 grid grid-cols-2 gap-1'>
              {(
                ['free', 'camp', 'insurance', 'institutional'] as UserTier[]
              ).map((tier) => {
                const cfg = TIER_CONFIG[tier]
                const isActive = effectiveTier === tier

                return (
                  <button
                    key={tier}
                    onClick={() => switchTier(tier)}
                    className={`rounded-sm px-2 py-1.5 text-[11px] font-semibold transition-all ${
                      isActive
                        ? `${cfg.color} text-white shadow-sm`
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    title={`Simulate ${cfg.label} tier`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
            <p className='mt-1.5 text-[10px] text-muted-foreground'>
              {flags.simulatedTier
                ? `Simulating ${effectiveTier} (DB: ${currentTier})`
                : `Using ${isLocal ? 'default (max)' : `DB tier (${currentTier})`}`}
            </p>
          </div>

          {/* Feature gates */}
          <div className='border-b border-border px-3 py-2.5'>
            <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
              Feature Gates
            </span>
            <div className='mt-1.5 flex flex-col gap-1.5'>
              {[
                { key: 'bypass3dGate' as const, label: '3D Lab', icon: Box },
                {
                  key: 'bypassAiGate' as const,
                  label: 'AI Features',
                  icon: Brain,
                },
                {
                  key: 'bypassSrsGate' as const,
                  label: 'SRS Review',
                  icon: Zap,
                },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => toggleGate(key)}
                  className='flex items-center justify-between rounded-sm px-2 py-1 transition-colors hover:bg-muted'
                >
                  <span className='flex items-center gap-1.5 text-[11px] text-foreground'>
                    <Icon className='h-3 w-3 text-muted-foreground' />
                    {label}
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      flags[key] ? 'bg-emerald-500' : 'bg-zinc-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className='flex items-center justify-between px-3 py-2'>
            <button
              onClick={resetAll}
              className='flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground'
            >
              <RefreshCcw className='h-3 w-3' />
              Reset
            </button>
            <a
              href='/dashboard/developer'
              className='flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-foreground'
            >
              <Terminal className='h-3 w-3' />
              Dev Console
              <ExternalLink className='h-3.5 w-3.5' />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
