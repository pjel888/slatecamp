'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Plus, Edit2, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface TaxonomyNode {
  id: string
  name: string
  level: number
  subject_area: string | null
  is_leaf: boolean
  parent_id: string | null
  children?: TaxonomyNode[]
}

interface TaxonomyEditorProps {
  initialNodes: TaxonomyNode[]
  disciplineId: string
}

export function TaxonomyEditor({ initialNodes, disciplineId }: TaxonomyEditorProps) {
  const [nodes, setNodes] = useState(initialNodes)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const startEdit = (node: TaxonomyNode) => {
    setEditingId(node.id)
    setEditingName(node.name)
  }

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('taxonomy_tree')
      .update({ name: editingName.trim() })
      .eq('id', editingId)

    if (!error) {
      setNodes(prev => prev.map(n => 
        n.id === editingId ? { ...n, name: editingName.trim() } : n
      ))
    }
    
    setEditingId(null)
    setEditingName('')
  }

  const addNode = async (parentId: string | null) => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('taxonomy_tree')
      .insert({
        discipline_id: disciplineId,
        name: 'New Topic',
        level: parentId ? 2 : 1,
        subject_area: parentId ? 'Subject' : null,
        is_leaf: true,
        parent_id: parentId,
      })
      .select()
      .single()

    if (!error && data) {
      setNodes(prev => [...prev, data])
    }
    
    setParentIdForNew(null)
  }

  const deleteNode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this node?')) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('taxonomy_tree')
      .delete()
      .eq('id', id)

    if (!error) {
      setNodes(prev => prev.filter(n => n.id !== id))
    }
  }

  const renderNode = (node: TaxonomyNode, level: number = 0) => {
    const isExpanded = expandedIds.has(node.id)
    const hasChildren = node.level < 3
    const isEditing = editingId === node.id

    return (
      <div key={node.id}>
        <div 
          className={cn(
            "flex items-center gap-2 py-2 px-3 hover:bg-muted/50 rounded-md",
            level > 0 && "ml-6"
          )}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpand(node.id)}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
          {level === 0 && <span className="w-5" />}
          
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                className="flex-1 px-2 py-1 text-sm rounded border border-input bg-background"
                autoFocus
              />
              <button
                onClick={saveEdit}
                className="text-green-600 hover:text-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium">
                {node.name}
              </span>
              <span className="text-xs text-muted-foreground mr-2">
                Level {node.level}
              </span>
              <button
                onClick={() => startEdit(node)}
                className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => deleteNode(node.id)}
                className="p-1 hover:bg-muted rounded text-red-600 opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => setParentIdForNew(node.id)}
                className="p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100"
              >
                <Plus className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
        
        {/* Add child node inline */}
        {parentIdForNew === node.id && (
          <div className="ml-12 py-2">
            <input
              type="text"
              placeholder="Enter topic name..."
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const supabase = createClient()
                  const { data } = await supabase
                    .from('taxonomy_tree')
                    .insert({
                      discipline_id: disciplineId,
                      name: e.currentTarget.value.trim(),
                      level: node.level + 1,
                      subject_area: 'Topic',
                      is_leaf: true,
                      parent_id: node.id,
                    })
                    .select()
                    .single()
                  
                  if (data) {
                    setNodes(prev => [...prev, data])
                  }
                  setParentIdForNew(null)
                }
                if (e.key === 'Escape') {
                  setParentIdForNew(null)
                }
              }}
              className="px-2 py-1 text-sm rounded border border-input bg-background w-64"
              autoFocus
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Taxonomy Tree</h2>
        <button
          onClick={() => addNode(null)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Subject
        </button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        {nodes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No taxonomy nodes found
          </div>
        ) : (
          <div className="p-4">
            {nodes
              .filter(n => !n.parent_id)
              .map(node => (
                <div key={node.id} className="group">
                  {renderNode(node)}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
