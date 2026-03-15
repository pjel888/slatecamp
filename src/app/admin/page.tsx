import { createClient } from '@/lib/supabase/server'
import { 
  FileQuestion, 
  FileText, 
  Box, 
  Network, 
  ClipboardList,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

async function getStats() {
  const supabase = await createClient()
  
  const [questionsRes, wikiRes, assetsRes, pendingRes] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('id', { count: 'exact', head: true }),
    supabase.from('models_3d').select('id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
  ])

  return {
    questions: questionsRes.count || 0,
    wikiArticles: wikiRes.count || 0,
    assets: assetsRes.count || 0,
    pendingReviews: pendingRes.count || 0,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const statCards = [
    {
      label: 'Questions',
      value: stats.questions,
      href: '/admin/questions',
      icon: FileQuestion,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Wiki Articles',
      value: stats.wikiArticles,
      href: '/admin/wiki',
      icon: FileText,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950',
    },
    {
      label: '3D Assets',
      value: stats.assets,
      href: '/admin/assets',
      icon: Box,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      label: 'Pending Reviews',
      value: stats.pendingReviews,
      href: '/admin/reviews',
      icon: ClipboardList,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950',
    },
  ]

  const quickActions = [
    { label: 'Add Question', href: '/admin/questions/new' },
    { label: 'Add Wiki Article', href: '/admin/wiki/new' },
    { label: 'Upload 3D Asset', href: '/admin/assets/new' },
    { label: 'Manage Taxonomy', href: '/admin/taxonomy' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage your platform content</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-2xl font-semibold">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No recent activity</p>
          <p className="text-sm">Activity will appear here as you manage content</p>
        </div>
      </div>
    </div>
  )
}
