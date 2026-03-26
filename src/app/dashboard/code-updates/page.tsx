import type { Metadata } from 'next'
import { getCodeUpdates } from '@/lib/actions/code-updates'
import { CodeUpdateFeed } from './_components/CodeUpdateFeed'

export const metadata: Metadata = {
  title: 'Code Updates — SlateCamp',
}

const CodeUpdatesPage = async () => {
  const { data, nextCursor } = await getCodeUpdates(undefined, 20)

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#1A2332] mb-1">Code Updates</h1>
        <p className="text-sm text-[#4A5568]">
          The latest changes to building codes and regulations that may appear on your exam.
        </p>
      </div>
      <CodeUpdateFeed initialUpdates={data} initialCursor={nextCursor} />
    </div>
  )
}

export default CodeUpdatesPage
