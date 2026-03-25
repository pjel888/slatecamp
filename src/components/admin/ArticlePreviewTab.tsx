'use client'

import { type ReactElement } from 'react'
import { StudentViewWatermark } from '@/components/ui/student-view-watermark'

interface ArticlePreviewTabProps {
  previewNode: ReactElement | null
  previewError: string | null
  title: string
}

export const ArticlePreviewTab = ({ previewNode, previewError, title }: ArticlePreviewTabProps) => {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <StudentViewWatermark label="Student View — This is exactly what students see" />

      {/* Preview content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        {previewError ? (
          <div className="max-w-[720px] mx-auto px-8 py-8">
            <div className="rounded-md border border-destructive/30 bg-[#FDF0F0] p-4">
              <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-destructive mb-2">
                Compilation Error
              </p>
              <pre className="whitespace-pre-wrap font-mono text-xs text-destructive leading-relaxed">
                {previewError}
              </pre>
            </div>
          </div>
        ) : previewNode ? (
          <div className="max-w-[720px] mx-auto px-8 py-8">
            <div className="wiki-prose max-w-none">
              {previewNode}
            </div>
          </div>
        ) : (
          <div className="max-w-[720px] mx-auto px-8 py-8">
            <p className="text-sm text-text-tertiary italic">
              Start typing to see a student-view preview...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
