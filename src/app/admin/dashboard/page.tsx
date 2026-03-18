import { getAdminStats } from '@/lib/actions/admin/dashboard'
import { Question, FileText, Cube, TreeStructure, ClipboardText } from "@phosphor-icons/react/dist/ssr"
import { SCIcon } from "@/components/graphics/icons/Icon"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Admin Dashboard</h1>
          <p className="text-zinc-500 mt-1">System status and content overview.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Questions", value: stats.questions, href: "/admin/questions", icon: Question, color: "text-primary", bg: "bg-[#EEF2FC]" },
          { label: "Wiki Articles", value: stats.wiki, href: "/admin/wiki", icon: FileText, color: "text-[#2D9F6F]", bg: "bg-[#EDFAF4]" },
          { label: "3D Assets", value: stats.assets, href: "/admin/assets", icon: Cube, color: "text-zinc-600", bg: "bg-zinc-50" },
        ].map((c) => (
          <Link key={c.label} href={c.href} className="group p-6 border border-zinc-200 rounded-md bg-white hover:border-zinc-300 hover:shadow-sm transition-all flex items-center gap-5">
            <div className={c.bg + " p-3 rounded-md"}><SCIcon icon={c.icon} size="lg" className={c.color} /></div>
            <div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wider">{c.label}</p>
              <p className="text-xl font-bold text-zinc-900">{c.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border border-zinc-200 rounded-md bg-white">
          <h2 className="text-lg font-semibold text-zinc-900 flex items-center gap-2 mb-4">
            <SCIcon icon={TreeStructure} size="md" className="text-zinc-400" /> Quick Management
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/taxonomy" className="p-3 border rounded-md hover:bg-zinc-50 text-sm font-medium text-center">Manage Taxonomy</Link>
            <Link href="/admin/audit" className="p-3 border rounded-md hover:bg-zinc-50 text-sm font-medium text-center">Audit Logs</Link>
            <Link href="/admin/questions/new" className="p-3 border rounded-md hover:bg-zinc-50 text-sm font-medium text-center">New Question</Link>
            <Link href="/admin/wiki/new" className="p-3 border rounded-md hover:bg-zinc-50 text-sm font-medium text-center">New Article</Link>
          </div>
        </div>

        <div className="p-6 border border-zinc-200 rounded-md bg-white flex flex-col items-center justify-center text-center">
          <SCIcon icon={ClipboardText} size="xl" className="text-zinc-200 mb-2" />
          <p className="text-sm text-zinc-500">No pending reviews.</p>
        </div>
      </div>
    </div>
  )
}
