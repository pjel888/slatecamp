'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useSidebar } from './SidebarProvider'
import { SidebarPanel } from './SidebarPanel'

// ---------------------------------------------------------------------------
// SidebarOverlay
// ---------------------------------------------------------------------------
// AnimatePresence wrapper rendering a backdrop scrim + expanded panel as
// siblings. Focus management moves focus into the panel on open and back
// to the rail toggle button on close.
// ---------------------------------------------------------------------------

interface SidebarOverlayProps {
  header: React.ReactNode
  nav: React.ReactNode
  footer: React.ReactNode
}

export const SidebarOverlay = ({ header, nav, footer }: SidebarOverlayProps) => {
  const { expanded, setExpanded, toggleRef } = useSidebar()
  const prefersReducedMotion = useReducedMotion()

  // -- Transitions (VIS-04: duration 0 when reduced motion) ----------------
  const backdropTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.15 }

  const panelTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: 'easeOut' as const }

  // -- Focus management (A11-01, A11-02) -----------------------------------
  // On expand, move focus to first focusable element inside the panel.
  useEffect(() => {
    if (!expanded) return

    const timer = setTimeout(() => {
      const panel = document.querySelector<HTMLElement>(
        '[role="dialog"][aria-label="Navigation sidebar"]',
      )
      const firstFocusable = panel?.querySelector<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      )
      firstFocusable?.focus()
    }, 50)

    return () => clearTimeout(timer)
  }, [expanded])

  // -- Backdrop click handler (OVR-04) -------------------------------------
  // Uses onMouseDown (not onClick) to avoid drag-release edge cases.
  // Focus returns to rail toggle via requestAnimationFrame.
  const handleBackdropClick = () => {
    setExpanded(false)
    requestAnimationFrame(() => {
      toggleRef.current?.focus()
    })
  }

  return (
    <AnimatePresence>
      {expanded && (
        <>
          {/* Backdrop -- SIBLING to panel, NOT parent (prevents click bubbling) */}
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={backdropTransition}
            className="fixed inset-0 z-[39] bg-black/25"
            onMouseDown={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.aside
            key="sidebar-panel"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { x: -20, opacity: 0 }
            }
            animate={
              prefersReducedMotion
                ? { opacity: 1 }
                : { x: 0, opacity: 1 }
            }
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { x: -20, opacity: 0 }
            }
            transition={panelTransition}
            className="fixed inset-y-0 left-0 z-[40] w-[260px] bg-white border-r border-border shadow-md"
            role="dialog"
            aria-label="Navigation sidebar"
          >
            <SidebarPanel header={header} nav={nav} footer={footer} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
