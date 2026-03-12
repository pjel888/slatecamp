import SharedPageLayout from '@/components/layouts/SharedPageLayout'
import React from 'react'

const NotesPageLayout = ({ children }: { children: React.ReactNode }) => {
  return <SharedPageLayout>{children}</SharedPageLayout>
}

export default NotesPageLayout
