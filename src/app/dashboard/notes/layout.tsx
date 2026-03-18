import React from 'react'

const NotesPageLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className='h-full w-full overflow-hidden'>{children}</div>
}

export default NotesPageLayout
