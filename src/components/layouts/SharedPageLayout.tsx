import React from 'react'

const SharedPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col p-6 h-full'>
      <div className='flex-1 flex flex-col overflow-auto'>
        {children}
      </div>
    </div>
  )
}

export default SharedPageLayout
