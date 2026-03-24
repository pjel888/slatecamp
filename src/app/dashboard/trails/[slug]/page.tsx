import { redirect } from 'next/navigation'

const TrailSlugRedirect = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params
  redirect(`/dashboard/camptrails/${slug}`)
}

export default TrailSlugRedirect
