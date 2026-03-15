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
      .eq('node_id', editingId)

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
      .select('id:node_id, name, level, subject_area, is_leaf, parent_id, discipline_id')
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
      .eq('node_id', id)

    if (!error) {
      setNodes(prev => prev.filter(n => n.id !== id))
    }
  }

  const renderNode = (node: TaxonomyNode, level: number = 0) => {
    const isExpanded = expandedIds.has(node.id)
    const isEditing = editingId === node.id
    const children = nodes.filter(n => n.parent_id === node.id)
    const hasChildren = children.length > 0 || node.level < 3

    return (
      <div key={node.id} className="min-w-0">
        <div 
          className={cn(
            "flex items-center gap-2 py-1.5 px-3 hover:bg-muted/50 rounded-md group",
            level > 0 && "ml-6 border-l border-border/50"
          )}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.id)}
              className="p-0.5 hover:bg-muted rounded shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="w-5 shrink-0" />
          )}
          
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
                className="text-xs font-medium text-green-600 hover:text-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 hover:bg-muted rounded text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium truncate">
                {node.name}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                L{node.level}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(node)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground"
                  title="Edit Name"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                {node.level < 3 && (
                  <button
                    onClick={() => setParentIdForNew(node.id)}
                    className="p-1 hover:bg-muted rounded text-blue-600"
                    title="Add Child"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => deleteNode(node.id)}
                  className="p-1 hover:bg-muted rounded text-red-600"
                  title="Delete Node"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Render children recursively */}
        {isExpanded && (
          <div className="space-y-0.5">
            {children.map(child => renderNode(child, level + 1))}
            
            {/* Inline add for this specific parent */}
            {parentIdForNew === node.id && (
              <div className={cn("py-2", level >= 0 && "ml-12")}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter child name..."
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        const name = e.currentTarget.value.trim()
                        const supabase = createClient()
                        const { data, error } = await supabase
                          .from('taxonomy_tree')
                          .insert({
                            discipline_id: disciplineId,
                            name,
                            level: node.level + 1,
                            subject_area: node.level === 1 ? 'Module' : 'Topic',
                            is_leaf: node.level + 1 === 3,
                            parent_id: node.id,
                          })
                          .select('id:node_id, name, level, subject_area, is_leaf, parent_id, discipline_id')
                          .single()
                        
                        if (!error && data) {
                          setNodes(prev => [...prev, data])
                          setExpandedIds(prev => new Set(prev).add(node.id))
                        }
                        setParentIdForNew(null)
                      }
                      if (e.key === 'Escape') {
                        setParentIdForNew(null)
                      }
                    }}
                    className="flex-1 px-2 py-1 text-sm rounded border border-input bg-background max-w-[200px]"
                    autoFocus
                  />
                  <button 
                    onClick={() => setParentIdForNew(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
              .filter(n => !n.parent_id && n.id)
              .map(node => (
                <div key={node.id || node.name} className="group">
                  {renderNode(node)}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
