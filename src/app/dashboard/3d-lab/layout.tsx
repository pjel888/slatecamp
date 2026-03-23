import React from 'react'

// 3D Lab needs full viewport height for the R3F Canvas.
// SharedPageLayout uses min-h-full + padding which breaks the h-full chain
// and collapses the 3D viewport to zero height.
const ThreeDLabLayoutPage = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-full w-full">{children}</div>
}

export default ThreeDLabLayoutPage
