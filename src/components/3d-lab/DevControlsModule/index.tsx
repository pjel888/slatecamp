'use client'

// DevControlsModule — Entry Point
// PD 1096 IRR Rules VII & VIII — Site Development Controls
// Three-layer architecture: Computation → State → R3F/DOM
// Layout V2: Collapsible Left Panel (240px) → 3D Viewport (flex) → Collapsible Right Panel (280px) → Status Bar

import DevControlsLabV2 from './dashboard/DevControlsLabV2'

export default function DevControlsModule() {
  return <DevControlsLabV2 />
}
