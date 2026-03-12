'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export type ModelId =
  | 'greek-parthenon'
  | 'roman-pantheon'
  | 'corinthian-capital'

export interface TreeNode {
  id: string
  label: string
  children?: TreeNode[]
  /** Present only on leaves; selects a 3D model. */
  modelId?: ModelId
}

export interface Callout {
  id: string
  position: [number, number, number]
  title: string
  description: string
  quiz?: {
    question: string
    options: string[]
    correctAnswerIndex: number
  }
}

type CalloutMap = Record<ModelId, Callout[]>

const CALLOUTS: CalloutMap = {
  'greek-parthenon': [
    {
      id: 'parthenon-entablature',
      position: [0, 0.7, 0.75],
      title: 'Entablature',
      description:
        'The entablature sits above the columns and is composed of the architrave, frieze, and cornice.',
      quiz: {
        question: 'Which element is NOT part of the entablature?',
        options: ['Architrave', 'Frieze', 'Cornice', 'Stylobate'],
        correctAnswerIndex: 3,
      },
    },
    {
      id: 'parthenon-stylobate',
      position: [0.9, -0.5, 0.6],
      title: 'Stylobate',
      description:
        'The stylobate is the stepped platform that supports the columns of a classical temple.',
    },
  ],
  'roman-pantheon': [
    {
      id: 'pantheon-dome',
      position: [0, 1.5, 0],
      title: 'Coffered Dome',
      description:
        'The Pantheon’s dome is a coffered concrete shell that gradually thins toward the oculus.',
    },
  ],
  'corinthian-capital': [
    {
      id: 'capital-abacus',
      position: [0, 0.6, 0.6],
      title: 'Abacus',
      description:
        'The abacus is the flat slab at the top of the capital that distributes load from the architrave.',
      quiz: {
        question:
          'Which order is characterized by acanthus leaves and an ornate abacus?',
        options: ['Doric', 'Ionic', 'Corinthian', 'Tuscan'],
        correctAnswerIndex: 2,
      },
    },
  ],
}

function getCalloutsForModel(modelId: ModelId): Callout[] {
  return CALLOUTS[modelId] ?? []
}

interface ThreeWorkspaceProps {
  activeModelId: ModelId
  callouts: Callout[]
  onSelectCallout: (callout: Callout) => void
}

/**
 * Dedicated R3F Canvas and scene. Safe client-only boundary for all 3D.
 */
export function ThreeWorkspace({
  activeModelId,
  callouts,
  onSelectCallout,
}: ThreeWorkspaceProps) {
  return (
    <div
      className='h-full w-full rounded-xl border border-border bg-muted'
      style={{ backgroundColor: 'var(--color-bone)' }}
    >
      <Canvas shadows camera={{ position: [4, 3, 6], fov: 45 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />

        {/* Ground plane for soft shadow */}
        <mesh receiveShadow rotation-x={-Math.PI / 2} position={[0, -1, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color='hsl(220, 15%, 94%)' />
        </mesh>

        {/* Active model */}
        <ActiveModel modelId={activeModelId} />

        <CalloutMarkers callouts={callouts} onSelectCallout={onSelectCallout} />

        <OrbitControls enablePan enableZoom enableRotate makeDefault />
      </Canvas>
    </div>
  )
}

interface ActiveModelProps {
  modelId: ModelId
}

/**
 * Phase 1 mock geometries. In Phase 2 you can swap each case
 * for a `useGLTF()`-powered component with minimal changes.
 */
function ActiveModel({ modelId }: ActiveModelProps) {
  switch (modelId) {
    case 'greek-parthenon':
      return (
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 1, 1.5]} />
          <meshStandardMaterial color='hsl(35, 80%, 60%)' roughness={0.4} />
        </mesh>
      )
    case 'roman-pantheon':
      return (
        <group>
          <mesh castShadow position={[0, -0.3, 0]}>
            <cylinderGeometry args={[1.6, 1.6, 1.0, 32]} />
            <meshStandardMaterial color='hsl(210, 15%, 70%)' roughness={0.5} />
          </mesh>
          <mesh castShadow position={[0, 0.8, 0]}>
            <sphereGeometry args={[1.3, 32, 32]} />
            <meshStandardMaterial color='hsl(210, 10%, 60%)' roughness={0.4} />
          </mesh>
        </group>
      )
    case 'corinthian-capital':
      return (
        <group>
          <mesh castShadow position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.7, 0.7, 1.2, 24]} />
            <meshStandardMaterial color='hsl(40, 50%, 75%)' roughness={0.3} />
          </mesh>
          <mesh castShadow position={[0, 0.3, 0]}>
            <boxGeometry args={[1.4, 0.3, 1.4]} />
            <meshStandardMaterial color='hsl(40, 40%, 85%)' roughness={0.4} />
          </mesh>
        </group>
      )
    default:
      return null
  }
}

interface CalloutMarkersProps {
  callouts: Callout[]
  onSelectCallout: (callout: Callout) => void
}

function CalloutMarkers({ callouts, onSelectCallout }: CalloutMarkersProps) {
  if (callouts.length === 0) return null

  return (
    <>
      {callouts.map((callout) => (
        <CalloutDot
          key={callout.id}
          callout={callout}
          onSelect={onSelectCallout}
        />
      ))}
    </>
  )
}

function CalloutDot({
  callout,
  onSelect,
}: {
  callout: Callout
  onSelect: (c: Callout) => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <mesh
      position={callout.position}
      scale={hovered ? 1.3 : 1}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(callout)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial
        color='#1f3055'
        emissive='#1f3055'
        emissiveIntensity={hovered ? 0.6 : 0.3}
      />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/* Split‑pane client shell: sidebar tree + workspace                  */
/* ------------------------------------------------------------------ */

interface ThreeDLabClientProps {
  tree: TreeNode[]
  initialModelId: ModelId
  /** Base pathname for this page, e.g. '/dashboard/3d-lab'. */
  basePath: string
}

/**
 * Client shell: 2‑pane layout, collapsible tree, URL-synced active model.
 * Keeps Canvas isolated in `ThreeWorkspace`.
 */
export function ThreeDLabClient({
  tree,
  initialModelId,
  basePath,
}: ThreeDLabClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeModelId, setActiveModelId] = useState<ModelId>(initialModelId)
  const [activeCallout, setActiveCallout] = useState<Callout | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(tree.map((n) => n.id)),
  )

  const handleToggleNode = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectModel = useCallback(
    (modelId: ModelId) => {
      setActiveModelId(modelId)
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      params.set('model', modelId)
      router.replace(`${basePath}?${params.toString()}`, { scroll: false })
    },
    [basePath, router, searchParams],
  )

  useEffect(() => {
    setActiveCallout(null)
  }, [activeModelId])

  const callouts = useMemo(
    () => getCalloutsForModel(activeModelId),
    [activeModelId],
  )

  const sidebar = useMemo<ReactNode>(
    () => (
      <nav className='space-y-2'>
        {tree.map((node) => (
          <TreeNodeItem
            key={node.id}
            node={node}
            expandedIds={expandedIds}
            onToggle={handleToggleNode}
            onSelectModel={handleSelectModel}
            activeModelId={activeModelId}
          />
        ))}
      </nav>
    ),
    [tree, expandedIds, handleToggleNode, handleSelectModel, activeModelId],
  )

  return (
    <div className='flex h-full gap-4'>
      {/* Sidebar */}
      <aside className='hidden w-64 shrink-0 flex-col border-r border-border/40 bg-sidebar p-3 lg:flex'>
        <div className='mb-3'>
          <p className='text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
            3D Library
          </p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Explore building systems and elements.
          </p>
        </div>
        <div className='flex-1 overflow-y-auto pr-1'>{sidebar}</div>
      </aside>

      {/* Workspace */}
      <main className='flex flex-1 flex-col overflow-hidden'>
        <div className='mb-3 flex items-center justify-between'>
          <div>
            <h1 className='text-lg font-semibold text-foreground'>
              3D Workspace
            </h1>
            <p className='mt-1 text-xs text-muted-foreground'>
              Rotate, zoom, and inspect the selected component.
            </p>
          </div>
        </div>
        <div className='relative mt-2 flex-1'>
          <ThreeWorkspace
            activeModelId={activeModelId}
            callouts={callouts}
            onSelectCallout={setActiveCallout}
          />
          <ActiveCalloutPanel
            callout={activeCallout}
            onClose={() => setActiveCallout(null)}
          />
        </div>
      </main>
    </div>
  )
}

interface TreeNodeItemProps {
  node: TreeNode
  expandedIds: Set<string>
  onToggle: (id: string) => void
  onSelectModel: (modelId: ModelId) => void
  activeModelId: ModelId
}

function TreeNodeItem({
  node,
  expandedIds,
  onToggle,
  onSelectModel,
  activeModelId,
}: TreeNodeItemProps) {
  const isLeaf = !node.children || node.children.length === 0
  const isExpanded = expandedIds.has(node.id)
  const isActive = node.modelId === activeModelId

  if (isLeaf && node.modelId) {
    return (
      <button
        type='button'
        onClick={() => onSelectModel(node.modelId as ModelId)}
        className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
          isActive
            ? 'bg-secondary text-foreground'
            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
        }`}
      >
        <span className='truncate'>{node.label}</span>
      </button>
    )
  }

  return (
    <div className='space-y-1'>
      <button
        type='button'
        onClick={() => onToggle(node.id)}
        className='flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-secondary/40 hover:text-foreground'
      >
        <span className='truncate font-medium'>{node.label}</span>
        <span className='ml-2 text-[10px] text-muted-foreground'>
          {isExpanded ? '−' : '+'}
        </span>
      </button>
      {isExpanded && node.children && (
        <div className='ml-3 border-l border-border/30 pl-2'>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelectModel={onSelectModel}
              activeModelId={activeModelId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface ActiveCalloutPanelProps {
  callout: Callout | null
  onClose: () => void
}

function ActiveCalloutPanel({ callout, onClose }: ActiveCalloutPanelProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  useEffect(() => {
    setSelectedIndex(null)
  }, [callout?.id])

  if (!callout) return null

  const hasQuiz = callout.quiz != null

  return (
    <div className='pointer-events-none absolute inset-0 z-10 flex items-start justify-end p-4'>
      <Card className='pointer-events-auto w-full max-w-sm shadow-[0_1px_3px_rgba(26,26,26,0.06)] transition-all duration-150 ease-linear'>
        <CardHeader className='flex flex-row items-start justify-between gap-3 pb-2'>
          <div className='space-y-1'>
            <CardTitle className='text-sm font-medium'>
              {callout.title}
            </CardTitle>
          </div>
          <Button
            variant='ghost'
            size='icon-sm'
            aria-label='Close'
            onClick={onClose}
          >
            <X className='h-4 w-4' strokeWidth={1.5} />
          </Button>
        </CardHeader>
        <CardContent className='space-y-3 pt-0'>
          <p className='text-xs leading-relaxed text-muted-foreground'>
            {callout.description}
          </p>

          {hasQuiz && callout.quiz && (
            <div className='space-y-2'>
              <p className='text-xs font-medium text-foreground'>
                {callout.quiz.question}
              </p>
              <div className='space-y-1.5'>
                {callout.quiz.options.map((option, index) => {
                  const isSelected = selectedIndex === index
                  return (
                    <button
                      key={option}
                      type='button'
                      onClick={() => setSelectedIndex(index)}
                      className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-all duration-150 ${
                        isSelected
                          ? 'bg-secondary text-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      }`}
                    >
                      <span className='truncate'>{option}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
