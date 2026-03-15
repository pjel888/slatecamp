import React from 'react'
import { DottedGridOverlay } from '../marketing/LandingPrimitives'

const SharedPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='relative flex h-full flex-col overflow-hidden p-2'>
      <div className='relative z-10 flex-1 overflow-hidden flex flex-col'>{children}</div>
      <DottedGridOverlay />
    </div>
  )
}

export default SharedPageLayout
