'use client'

// SharedToolbarBridge — syncs shared toolbar state to DevControls store
// Subscribes to useViewportShellStore and forwards relevant toggles to useDevControlsStore.
// This bridges the shared SceneToolbar/CameraNavigationBar with the DevControls-specific scene.

import { useEffect } from 'react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import { useDevControlsStore } from '../stores/useDevControlsStore'

export const SharedToolbarBridge = () => {
  // Bridge: shared dimensions toggle -> DevControls showDimensions
  useEffect(() => {
    let prev = useViewportShellStore.getState().dimensionsVisible
    const unsubscribe = useViewportShellStore.subscribe((state) => {
      if (state.dimensionsVisible !== prev) {
        prev = state.dimensionsVisible
        useDevControlsStore.getState().setShowDimensions(state.dimensionsVisible)
      }
    })
    return unsubscribe
  }, [])

  // Bridge: shared xray toggle -> DevControls xrayMode
  useEffect(() => {
    let prev = useViewportShellStore.getState().xrayMode
    const unsubscribe = useViewportShellStore.subscribe((state) => {
      if (state.xrayMode !== prev) {
        prev = state.xrayMode
        useDevControlsStore.getState().setXrayMode(state.xrayMode)
      }
    })
    return unsubscribe
  }, [])

  // Bridge: shared layers panel -> DevControls layers toggle via custom event
  // The DevControls LayersOverlay previously listened to a custom event
  useEffect(() => {
    let prev = useViewportShellStore.getState().layersPanelOpen
    const unsubscribe = useViewportShellStore.subscribe((state) => {
      if (state.layersPanelOpen !== prev) {
        prev = state.layersPanelOpen
        if (state.layersPanelOpen) {
          window.dispatchEvent(new CustomEvent('slatecamp:toggle-layers'))
        }
      }
    })
    return unsubscribe
  }, [])

  return null // Invisible bridge component
}
