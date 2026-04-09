'use client'

// useCollaborationPresence — foundation for real-time collaboration in 3D Lab
// Broadcasts cursor position and user status via Supabase Realtime presence channel.
// This is the infrastructure layer only — full collaborative editing is a separate project.
//
// Architecture:
//   1. Each user joins a presence channel for the current module
//   2. Cursor position is broadcast on mouse move (throttled to 50ms)
//   3. Other users' cursors are rendered as colored indicators in the viewport
//   4. User status text describes what they're doing ("Editing Level 2 North Wing")
//
// Not implemented yet (future):
//   - Element locking (prevent concurrent edits)
//   - Real-time parameter sync
//   - Conflict resolution
//   - Permission levels (Owner/Admin/Editor/Reviewer/Viewer)

import { useState, useEffect, useCallback, useRef } from 'react'

export interface PresenceUser {
  userId: string
  displayName: string
  avatarColor: string
  cursorPosition: { x: number; y: number } | null
  status: string
  lastSeen: number
}

interface UseCollaborationPresenceOptions {
  moduleId: string
  userId: string
  displayName: string
  /** Whether presence is enabled (requires Supabase Realtime) */
  enabled?: boolean
}

// Predefined avatar colors for up to 8 concurrent users
const AVATAR_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

export const useCollaborationPresence = ({
  moduleId,
  userId,
  displayName,
  enabled = false,
}: UseCollaborationPresenceOptions) => {
  const [peers, setPeers] = useState<PresenceUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const cursorRef = useRef<{ x: number; y: number } | null>(null)
  const statusRef = useRef('Viewing')

  // Assign a consistent color based on userId hash
  const avatarColor = AVATAR_COLORS[
    Math.abs(userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length
  ]

  const updateCursor = useCallback((x: number, y: number) => {
    cursorRef.current = { x, y }
    // In a real implementation, this would broadcast via Supabase Realtime
    // channel.track({ cursor: { x, y }, status: statusRef.current })
  }, [])

  const updateStatus = useCallback((status: string) => {
    statusRef.current = status
    // In a real implementation: channel.track({ cursor: cursorRef.current, status })
  }, [])

  // Cleanup stale peers (not seen in 10s)
  useEffect(() => {
    if (!enabled) return

    const interval = setInterval(() => {
      const now = Date.now()
      setPeers((prev) => prev.filter((p) => now - p.lastSeen < 10000))
    }, 5000)

    return () => clearInterval(interval)
  }, [enabled])

  // Connection lifecycle placeholder
  useEffect(() => {
    if (!enabled) return

    // In a real implementation:
    // 1. Create Supabase Realtime channel for this moduleId
    // 2. Subscribe to presence events
    // 3. Track our own presence
    // 4. Listen for peer presence changes
    //
    // const channel = supabase.channel(`3d-lab:${moduleId}`)
    // channel.on('presence', { event: 'sync' }, () => { ... })
    // channel.subscribe(async (status) => {
    //   if (status === 'SUBSCRIBED') {
    //     await channel.track({ userId, displayName, cursor: null, status: 'Viewing' })
    //     setIsConnected(true)
    //   }
    // })

    setIsConnected(false) // Will be true when Supabase integration is wired

    return () => {
      // channel.unsubscribe()
      setIsConnected(false)
    }
  }, [enabled, moduleId, userId, displayName])

  return {
    /** Other users currently in this module */
    peers,
    /** Whether we're connected to the presence channel */
    isConnected,
    /** Our avatar color */
    avatarColor,
    /** Update our cursor position (call on mouse move, throttled) */
    updateCursor,
    /** Update our status text (call on significant actions) */
    updateStatus,
    /** Number of other users in this module */
    peerCount: peers.length,
  }
}
