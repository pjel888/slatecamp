import dynamic from 'next/dynamic'

const WikiEditor = dynamic(
  () => import('@/components/admin/WikiEditor').then(m => m.WikiEditor),
)

const NewWikiArticlePage = () => {
  return <WikiEditor />
}

export default NewWikiArticlePage
