import type { Metadata } from 'next'
import { getCodeUpdates } from '@/lib/actions/code-updates'
import { LearnLayout } from '@/components/layouts/category/LearnLayout'
import { CodeUpdateFeed } from './_components/CodeUpdateFeed'

export const metadata: Metadata = {
  title: 'Code Updates — SlateCamp',
}

const CodeUpdatesPage = async () => {
  const { data, nextCursor } = await getCodeUpdates(undefined, 20)

  return (
    <LearnLayout
      hero={{
        subtitle: 'Code Updates',
        description: 'The latest changes to building codes and regulations that may appear on your exam.',
      }}
    >
      <CodeUpdateFeed initialUpdates={data} initialCursor={nextCursor} />
    </LearnLayout>
  )
}

export default CodeUpdatesPage
