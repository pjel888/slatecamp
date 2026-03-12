import React from 'react'

const SharedPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col h-full overflow-scroll bg-slatecamp-paper-snow'>
      {children}
    </div>
  )
}

export default SharedPageLayout
