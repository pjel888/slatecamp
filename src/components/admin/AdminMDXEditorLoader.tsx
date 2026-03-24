'use client'

import dynamic from 'next/dynamic'

const AdminMDXEditor = dynamic(
  () => import('./AdminMDXEditor').then(m => m.AdminMDXEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-sm text-muted-foreground">Loading editor...</div>
      </div>
    ),
  }
)

export { AdminMDXEditor }
