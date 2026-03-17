'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { BookOpen, ChevronRight, ChevronDown, Target, Brain, Zap, AlertTriangle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { getTaxonomyTree } from '@/lib/actions/taxonomy'
import type { TaxonomyNode } from '@/types/app'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

interface SubjectDrillSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  disciplineId: string
  onStart: (config: { mode: string, topicIds: string[], count: number, config?: any }) => void
}

export function SubjectDrillSelector({
  open,
  onOpenChange,
  disciplineId,
  onStart,
}: SubjectDrillSelectorProps) {
  const [tree, setTree] = useState<TaxonomyNode[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(10)

  useEffect(() => {
    if (open && tree.length === 0) {
      setLoading(true)
      getTaxonomyTree(disciplineId)
        .then((nodes) => setTree(nodes as unknown as import('@/types/app').TaxonomyNode[]))
        .finally(() => setLoading(false))
    }
  }, [open, disciplineId, tree.length])

  const selectedNode = useMemo(() => {
    const findNode = (nodes: TaxonomyNode[]): TaxonomyNode | null => {
      for (const node of nodes) {
        if (node.node_id === selectedNodeId) return node
        if (node.children) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return null
    }
    return findNode(tree)
  }, [tree, selectedNodeId])

  const toggleExpand = (id: string) => {
    const next = new Set(expandedNodes)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedNodes(next)
  }

  const getMasteryColor = (mastery?: number) => {
    if (mastery === undefined) return 'bg-zinc-200'
    if (mastery < 0.4) return 'bg-red-500'
    if (mastery < 0.7) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const renderNode = (node: TaxonomyNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.node_id)
    const hasChildren = node.children && node.children.length > 0
    const isSelected = selectedNodeId === node.node_id
    
    // Desirable Difficulty: Visual alerts for low mastery or long neglect
    const isNeglected = node.last_encountered && (Date.now() - new Date(node.last_encountered).getTime() > 7 * 24 * 60 * 60 * 1000)
    const isWeak = node.mastery !== undefined && node.mastery < 0.5

    return (
      <div key={node.node_id} className="select-none">
        <div 
          onClick={() => {
            setSelectedNodeId(node.node_id)
            if (hasChildren && !isExpanded) toggleExpand(node.node_id)
          }}
          className={cn(
            "flex items-center gap-2 p-2 rounded-sm cursor-pointer transition-colors group relative",
            isSelected ? "bg-zinc-900 text-white" : "hover:bg-zinc-100 text-zinc-700"
          )}
          style={{ paddingLeft: `${depth * 1.5 + 0.5}rem` }}
        >
          <div className="w-4 h-4 flex items-center justify-center shrink-0">
            {hasChildren ? (
              <div onClick={(e) => { e.stopPropagation(); toggleExpand(node.node_id); }}>
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </div>
            ) : (
              <div className="w-1 h-1 rounded-full bg-current opacity-30" />
            )}
          </div>
          
          {/* Mastery Indicator Dot */}
          <div className={cn("w-2 h-2 rounded-full shrink-0", getMasteryColor(node.mastery))} />
          
          <span className="text-[13px] font-medium truncate">{node.name}</span>
          
          <div className="ml-auto flex items-center gap-1.5">
            {isWeak && <AlertTriangle className="h-3 w-3 text-red-500" />}
            {isNeglected && <Clock className="h-3 w-3 text-amber-500" />}
            <span className={cn(
              "text-[9px] font-bold opacity-60",
              isSelected ? "text-white" : "text-zinc-400"
            )}>
              {node.mastery !== undefined ? `${Math.round(node.mastery * 100)}%` : '--'}
            </span>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-0.5 border-l border-zinc-100 ml-4">
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[650px] bg-white border-zinc-200 shadow-lg rounded-md p-0 overflow-hidden flex flex-col max-h-[90vh]'>
        <div className='h-1.5 bg-blue-600 w-full' />

        <div className="flex flex-col md:flex-row h-full">
          {/* Left Panel: Taxonomy Tree */}
          <div className="w-full md:w-3/5 flex flex-col border-r border-zinc-100">
            <DialogHeader className='px-6 pt-6 pb-4 shrink-0'>
              <DialogTitle className='text-lg font-bold text-zinc-900'>
                Syllabus Explorer
              </DialogTitle>
              <DialogDescription className='text-xs text-zinc-500'>
                Target weak areas to build desirable difficulty.
              </DialogDescription>
            </DialogHeader>

            <div className='flex-1 overflow-y-auto px-4 pb-6 scrollbar-thin'>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full py-20 space-y-4">
                  <div className="h-6 w-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium text-zinc-400">Loading taxonomy...</span>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {tree.map(node => renderNode(node))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Context & Config */}
          <div className="w-full md:w-2/5 bg-zinc-50 flex flex-col">
            <div className="p-6 flex-1 space-y-6">
              {selectedNode ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
                  <div className="p-4 bg-white rounded-sm border border-zinc-200 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Active Selection</p>
                    <h4 className="text-sm font-bold text-zinc-900 leading-tight">{selectedNode.name}</h4>
                    
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Mastery</p>
                        <p className={cn("text-xs font-bold", getMasteryColor(selectedNode.mastery).replace('bg-', 'text-'))}>
                          {selectedNode.mastery !== undefined ? `${Math.round(selectedNode.mastery * 100)}%` : 'New Topic'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Last Seen</p>
                        <p className="text-xs font-bold text-zinc-600">
                          {selectedNode.last_encountered ? formatDistanceToNow(new Date(selectedNode.last_encountered)) + ' ago' : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedNode.mastery !== undefined && selectedNode.mastery > 0.8 && (
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-sm flex gap-3">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      <p className="text-[11px] text-amber-700 leading-snug">
                        <span className="font-bold">Illusion of Competence Risk:</span> You already have high mastery here. Consider a harder topic to maintain desirable difficulty.
                      </p>
                    </div>
                  )}

                  <div className='space-y-3 pt-2'>
                    <Label className='text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400'>
                      Question Count
                    </Label>
                    <div className="flex gap-1 bg-white p-1 rounded-sm border border-zinc-200 shadow-sm">
                      {[5, 10, 20, 50].map(val => (
                        <button
                          key={val}
                          onClick={() => setQuestionCount(val)}
                          className={cn(
                            "flex-1 py-1 text-[11px] font-bold rounded-sm transition-all",
                            questionCount === val 
                              ? "bg-zinc-900 text-white" 
                              : "text-zinc-500 hover:text-zinc-700"
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-zinc-300" />
                  </div>
                  <p className="text-sm font-bold text-zinc-400">Select a topic to view pedagogical insights</p>
                </div>
              )}
            </div>

            <div className='p-6 bg-white border-t border-zinc-100'>
              <Button
                onClick={() => {
                  if (selectedNodeId) {
                    onStart({ mode: 'camp', topicIds: [selectedNodeId], count: questionCount, config: { isSubjectMode: true } })
                    onOpenChange(false)
                  }
                }}
                disabled={!selectedNodeId}
                className='w-full h-10 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center gap-2 group'
              >
                Launch Drill
                <Zap className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}>{children}</div>
}
