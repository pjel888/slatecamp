'use client'

import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { LabViewport } from './LabViewport'
import { getModuleById } from '../_config/moduleRegistry'

interface ModuleViewerProps {
  modelId: string
  basePath: string
}

/**
 * Full-screen 3D module viewer with a back button to the gallery.
 * Shows context scenario banner and ALE question count from registry metadata.
 */
export const ModuleViewer = ({ modelId, basePath }: ModuleViewerProps) => {
  const entry = getModuleById(modelId)
  const title = entry?.title ?? modelId.replace(/-/g, ' ')

  return (
    <div className="relative h-full w-full">
      {/* Back button + title bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <Link
          href={basePath}
          className="flex items-center gap-1.5 rounded-sm bg-white/90 backdrop-blur-sm border border-zinc-200 px-3 py-1.5 shadow-sm hover:bg-white transition-colors duration-150"
        >
          <SCIcon icon={ArrowLeft} size="xs" className="text-zinc-600" />
          <span className="text-[11px] font-medium text-zinc-600">Library</span>
        </Link>
        {entry?.codeRef && (
          <span className="rounded-sm bg-white/80 backdrop-blur-sm border border-zinc-200 px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-zinc-500 shadow-sm">
            {entry.codeRef}
          </span>
        )}
        {entry?.aleQuestionCount != null && (
          <span className="rounded-sm bg-white/80 backdrop-blur-sm border border-zinc-200 px-2 py-1 font-[family-name:var(--font-dm-mono)] text-[11px] text-[#E8853A] shadow-sm">
            ~{entry.aleQuestionCount} ALE questions / sitting
          </span>
        )}
      </div>

      {/* Full-screen viewport */}
      <LabViewport
        modelId={modelId}
        model={{
          model_id: modelId,
          name: title,
          slug: modelId,
          url: '',
        }}
        parameters={[]}
        hotspots={[]}
        userTier="camp"
      />
    </div>
  )
}
