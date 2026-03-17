import React from 'react'

const SharedPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col  h-full p-2'>
      <div className='flex-1 flex flex-col overflow-auto'>{children}</div>
    </div>
  )
}

export default SharedPageLayout
