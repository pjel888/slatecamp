import type { Metadata } from 'next'
import { getPipelineArticles } from '@/lib/actions/admin/pipeline'
import { SectionHeader } from '@/components/shared/section-header'
import { PipelineClient } from './_components/PipelineClient'

export const metadata: Metadata = { title: 'Publishing Pipeline — SlateCamp Admin' }

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const PipelinePage = async () => {
  const articles = await getPipelineArticles()

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Quality"
        title="Publishing Pipeline"
        subtitle="Track content through the publishing workflow"
        level="page"
      />

      <PipelineClient initialArticles={articles as any} />
    </div>
  )
}

export default PipelinePage
