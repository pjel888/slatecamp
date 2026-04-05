import { type ReactElement } from 'react'
import { StudentViewWatermark } from '@/components/ui/student-view-watermark'

interface ArticlePreviewTabProps {
  previewNode: ReactElement | null
  previewError: string | null
  title: string
}

const WIKI_PROSE_CLASS_NAME =
  'prose prose-wiki dark:prose-invert max-w-none font-sans text-[15px] leading-[1.7] prose-p:mb-4 prose-p:last:mb-0 prose-p:max-w-[65ch] prose-strong:font-semibold prose-em:text-inherit prose-code:rounded-[3px] prose-code:bg-muted prose-code:px-[5px] prose-code:py-px prose-code:text-[12px] prose-code:text-primary prose-code:font-[var(--font-dm-mono)] prose-code:before:content-none prose-code:after:content-none prose-code:dark:bg-[var(--wiki-prose-invert-code-bg)] prose-code:dark:text-[var(--wiki-prose-invert-code)] prose-h2:mt-0 prose-h2:mb-4 prose-h2:font-sans prose-h2:text-[22px] prose-h2:font-bold prose-h3:mt-7 prose-h3:mb-3 prose-h3:font-sans prose-h3:text-base prose-h3:font-semibold prose-hr:my-10'

export const ArticlePreviewTab = ({ previewNode, previewError, title: _title }: ArticlePreviewTabProps) => {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <StudentViewWatermark label="Student View — This is exactly what students see" />

      {/* Preview content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        {previewError ? (
          <div className="max-w-[720px] mx-auto px-8 py-8">
            <div className="rounded-md border border-destructive/30 bg-destructive-50 p-4">
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
            <div className={WIKI_PROSE_CLASS_NAME}>
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
