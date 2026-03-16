'use client'

import { useCallback, useEffect, useMemo, useState, Suspense, Component, type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Float, ContactShadows, Environment } from '@react-three/drei'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { Group } from 'three'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { X, Info, Layers, Lock, Loader2, ChevronRight, Box } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { LabViewport } from '@/app/dashboard/3d-lab/_components/LabViewport'

const NBCPEnvelope = dynamic(
  () => import('@/app/dashboard/3d-lab/_scenes/NBCPEnvelope'),
  { ssr: false },
)

const PARAMETRIC_SCENES = new Set(['nbcp-envelope'])

/* ── Types ── */

export type ModelId = string

export interface TreeNode {
  id: string
  label: string
  modelId?: ModelId
  children?: TreeNode[]
}

export interface Model3D {
  model_id: string
  name: string
  slug: string
  url: string
  thumbnail?: string
}

export interface ModelParameter {
  param_id: string
  name: string
  label: string
  min_value: number
  max_value: number
  default_val: number
  step: number
  unit?: string
}

export interface SpatialHotspot {
  hotspot_id: string
  title: string
  description: string
  position: [number, number, number]
  node_id?: string
}

/* ── Error Boundary ── */

class SceneErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: any) {
    console.error("3D Scene Error:", error)
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

/* ── Sub-Components ── */

/**
 * Simple 3D Box fallback if the GLTF model fails to load.
 */
function SimpleBox({ xRayOpacity }: { xRayOpacity: number }) {
  return (
    <mesh position={[0, 0, 0]} castShadow receiveShadow>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial 
        color="#3D5A9C" 
        transparent={true} 
        opacity={xRayOpacity} 
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  )
}

/**
 * Renders a GLTF model with dynamic material control for X-Ray.
 * Loads with GLTFLoader so fetch failures (e.g. CORS, 404) show the fallback
 * instead of throwing and logging to console.
 */
function DynamicModel({ url, xRayOpacity }: { url: string; xRayOpacity: number }) {
  const [scene, setScene] = useState<Group | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    setScene(null)
    setLoadFailed(false)
    const loader = new GLTFLoader()
    loader.load(
      url,
      (gltf) => setScene(gltf.scene),
      undefined,
      () => setLoadFailed(true)
    )
  }, [url])

  useEffect(() => {
    if (!scene) return
    scene.traverse((child: unknown) => {
      const mesh = child as { isMesh?: boolean; material?: { transparent: boolean; opacity: number }; name?: string }
      if (mesh.isMesh && mesh.material) {
        mesh.material.transparent = true
        const name = (mesh.name ?? '').toLowerCase()
        if (name.includes('envelope') || name.includes('finish')) {
          mesh.material.opacity = xRayOpacity
        } else {
          mesh.material.opacity = 1.0
        }
      }
    })
  }, [scene, xRayOpacity])

  if (loadFailed) return <SimpleBox xRayOpacity={xRayOpacity} />
  if (!scene) return null
  return <primitive object={scene} scale={1.5} position={[0, -1, 0]} castShadow receiveShadow />
}

/**
 * Floating 3D labels mapped to spatial hotspots.
 */
function HotspotMarkers({ hotspots, onSelect }: { hotspots: SpatialHotspot[], onSelect: (h: SpatialHotspot) => void }) {
  return (
    <>
      {hotspots.map((h) => (
        <Float key={h.hotspot_id} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh 
            position={h.position} 
            onClick={(e) => {
              e.stopPropagation()
              onSelect(h)
            }}
          >
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#3D5A9C" emissive="#3D5A9C" emissiveIntensity={2} />
            <Html distanceFactor={10}>
              <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md border border-zinc-200 shadow-sm whitespace-nowrap pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-900">{h.title}</span>
              </div>
            </Html>
          </mesh>
        </Float>
      ))}
    </>
  )
}

/* ── Main Workspace ── */

interface WorkspaceProps {
  model: Model3D
  parameters: ModelParameter[]
  hotspots: SpatialHotspot[]
  userTier: string
}

export function Workspace({ model, parameters, hotspots, userTier }: WorkspaceProps) {
  const [xRayOpacity, setXRayOpacity] = useState(1.0)
  const [activeHotspot, setActiveHotspot] = useState<SpatialHotspot | null>(null)
  const isLocked = userTier === 'free'

  if (isLocked) {
    return (
      <div className="h-full w-full rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 flex flex-col items-center justify-center p-12 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-white shadow-sm flex items-center justify-center border border-zinc-100">
          <Lock className="h-10 w-10 text-zinc-300" />
        </div>
        <div className="max-w-xs space-y-2">
          <h3 className="text-xl font-bold text-zinc-900">3D Lab is Gated</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Parametric spatial learning and X-Ray visualization are available exclusively for **Camp** and **Institutional** tiers.
          </p>
        </div>
        <Button className="bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl px-8 font-bold">
          Upgrade to Experience Spatial
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full w-full relative group">
      {/* 3D Canvas */}
      <div className="h-full w-full rounded-2xl border border-zinc-100 bg-[#FBFBFA] overflow-hidden shadow-inner">
        <Canvas shadows camera={{ position: [5, 5, 5], fov: 35 }}>
          <SceneErrorBoundary fallback={<SimpleBox xRayOpacity={xRayOpacity} />}>
            <Suspense fallback={null}>
              <Environment preset="city" />
              <ambientLight intensity={0.5} />
              <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
              
              <DynamicModel url={model.url} xRayOpacity={xRayOpacity} />
              <HotspotMarkers hotspots={hotspots} onSelect={setActiveHotspot} />
              
              <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
              <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
            </Suspense>
          </SceneErrorBoundary>
        </Canvas>
      </div>

      {/* X-Ray Controls (Bottom Center) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-xs">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Layers className="h-3 w-3" />
              X-Ray Visibility
            </span>
            <span className="text-[10px] font-bold text-zinc-900">{Math.round((xRayOpacity ?? 1) * 100)}%</span>
          </div>
          <Slider 
            value={[(xRayOpacity ?? 1) * 100]} 
            onValueChange={(v: number[]) => {
              if (v && v.length > 0) {
                const val = v[0]
                if (typeof val === 'number' && !isNaN(val)) {
                  setXRayOpacity(val / 100)
                }
              }
            }}
            max={100} 
            step={1}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Info Panel (Right) */}
      <AnimatePresence>
        {activeHotspot && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-6 right-6 z-20 w-80"
          >
            <Card className="rounded-2xl shadow-2xl border-zinc-100/50 bg-white/95 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  {activeHotspot.title}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setActiveHotspot(null)} className="h-8 w-8 rounded-full hover:bg-zinc-100">
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {activeHotspot.description}
                </p>
                <div className="pt-4 border-t border-zinc-50 flex gap-2">
                   <Button variant="outline" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl">
                     Add to Notes
                   </Button>
                   <Button variant="secondary" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl">
                     Wiki Detail
                   </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <Suspense fallback={
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-50/50 backdrop-blur-xs">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Rendering Scene...</span>
          </div>
        </div>
      } />
    </div>
  )
}

/* ── ThreeDLabClient ── */

interface ThreeDLabClientProps {
  tree: TreeNode[]
  initialModelId: ModelId
  basePath: string
}

export function ThreeDLabClient({ tree, initialModelId, basePath }: ThreeDLabClientProps) {
  const [selectedModelId, setSelectedModelId] = useState<ModelId>(initialModelId)
  
  // Mock data for models - in real app this would come from props or fetch
  const modelData: Model3D = {
    model_id: selectedModelId,
    name: selectedModelId.replace(/-/g, ' ').toUpperCase(),
    slug: selectedModelId,
    url: "https://pub-8cfdf823528b4754a757d00162e85e3b.r2.dev/parthenon.glb"
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-zinc-200 bg-white flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            <Box className="h-5 w-5 text-blue-600" />
            3D Assets
          </h2>
        </div>
        <nav className="p-4 space-y-6">
          {tree.map(group => (
            <div key={group.id} className="space-y-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">{group.label}</h3>
              <div className="space-y-1">
                {group.children?.map(item => (
                  <div key={item.id} className="space-y-1">
                    <p className="text-[11px] font-bold text-zinc-500 px-2 py-1">{item.label}</p>
                    {item.children?.map(leaf => (
                      <Link
                        key={leaf.id}
                        href={`${basePath}?model=${leaf.modelId}`}
                        onClick={() => setSelectedModelId(leaf.modelId!)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all",
                          selectedModelId === leaf.modelId 
                            ? "bg-blue-50 text-blue-700 shadow-sm" 
                            : "text-zinc-600 hover:bg-zinc-50"
                        )}
                      >
                        {leaf.label}
                        {selectedModelId === leaf.modelId && <ChevronRight className="h-3 w-3" />}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Viewport — routes to parametric/anatomy/gltf based on modelId */}
      <main className="flex-1 bg-zinc-50 p-6 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 min-h-0">
          {PARAMETRIC_SCENES.has(selectedModelId) ? (
            selectedModelId === 'nbcp-envelope' ? (
              <NBCPEnvelope />
            ) : null
          ) : (
            <Workspace
              model={modelData}
              parameters={[]}
              hotspots={[]}
              userTier="camp" // Hardcoded for now
            />
          )}
        </div>
      </main>
    </div>
  )
}
