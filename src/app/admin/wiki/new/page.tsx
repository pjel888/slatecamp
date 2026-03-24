import { redirect } from 'next/navigation'

const NewWikiPage = () => {
  redirect('/admin/articles/new')
}

export default NewWikiPage
