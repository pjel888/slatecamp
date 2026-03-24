import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

const EditWikiPage = async ({ params }: PageProps) => {
  const { id } = await params
  redirect(`/admin/articles/${id}`)
}

export default EditWikiPage
