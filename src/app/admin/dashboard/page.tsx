import { redirect } from 'next/navigation'

// /admin/dashboard now redirects to /admin (the admin overview)
const AdminDashboardRedirect = () => {
  redirect('/admin')
}

export default AdminDashboardRedirect
