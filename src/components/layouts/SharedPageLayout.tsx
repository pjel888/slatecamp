import React from 'react'
import { DottedGridOverlay } from '../marketing/LandingPrimitives'

const SharedPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='relative flex flex-col p-2'>
      <div className='relative z-10 flex-1 flex flex-col overflow-auto'>
        {children}
      </div>
      <DottedGridOverlay />
    </div>
  )
}

export default SharedPageLayout
