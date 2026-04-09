'use client'

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'
import type { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'

interface ExplodedPartsSidebarProps {
  config: ExplodedAssemblyConfig
  useStore: ReturnType<typeof createModuleStore>
}

/**
 * ExplodedPartsSidebar — Parts list + active part detail for exploded assembly.
 * Extracted from ExplodedAssembly template to serve as ViewportSidebar slot content.
 */
export const ExplodedPartsSidebar = ({ config, useStore }: ExplodedPartsSidebarProps) => {
  const activeAnnotation = useStore((s) => s.activeAnnotation)
  const setActiveAnnotation = useStore((s) => s.setActiveAnnotation)

  const activePart = useMemo(
    () => (activeAnnotation ? config.parts.find((p) => p.id === activeAnnotation) : null),
    [activeAnnotation, config.parts],
  )

  return (
    <div className="p-2 space-y-1">
      {/* Parts list */}
      {config.parts.map((part) => {
        const isActive = activeAnnotation === part.id
        return (
          <button
            key={part.id}
            onClick={() => setActiveAnnotation(isActive ? null : part.id)}
            className={`w-full text-left rounded px-2 py-1.5 transition-colors cursor-pointer ${
              isActive
                ? 'bg-primary-50 border border-primary/30'
                : 'hover:bg-muted border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm shrink-0 border border-black/10"
                style={{ backgroundColor: part.geometry.color }}
              />
              <span className="text-[11px] font-medium text-foreground truncate">
                {part.label}
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground uppercase">
                {part.geometry.type}
              </span>
            </div>
          </button>
        )
      })}

      {/* Active part detail */}
      <AnimatePresence>
        {activePart && (
          <motion.div
            key={activePart.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border mt-1 pt-2 px-1">
              {activePart.description && (
                <p className="text-[11px] text-text-secondary leading-relaxed mb-1.5">
                  {activePart.description}
                </p>
              )}
              {activePart.codeCitation && (
                <div className="text-[11px] text-muted-foreground">
                  {activePart.codeCitation}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
