import React from 'react'

const SharedPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='flex flex-col p-2 xl:p-3 2xl:p-4 2xl:max-w-[1400px] 2xl:mx-auto 2xl:w-full h-full'>
      <div className='flex flex-col'>{children}</div>
    </div>
  )
}

export default SharedPageLayout
