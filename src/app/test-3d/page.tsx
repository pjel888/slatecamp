'use client'
import dynamic from 'next/dynamic'
const SiteControls = dynamic(
  () => import('../dashboard/3d-lab/_scenes/SiteControls'),
  { ssr: false, loading: () => <div style={{ padding: 40 }}>Loading...</div> },
)
export default function Test3D() {
  return <div style={{ width: '100vw', height: '100vh' }}><SiteControls /></div>
}
