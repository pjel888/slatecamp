import { redirect } from 'next/navigation'

/**
 * /dashboard/trails redirects to /dashboard/camptrails
 * All Camp Trail routes live under /dashboard/camptrails/
 */
const TrailsRedirect = () => {
  redirect('/dashboard/camptrails')
}

export default TrailsRedirect
