'use client'

import { useState } from 'react'
import { CaretRight, CaretDown, Plus, PencilSimple, Trash, XCircle } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/dialog'
import {
  updateTaxonomyNode,
  createTaxonomyNode,
  deleteTaxonomyNode,
} from '@/lib/actions/admin/taxonomy'

interface TaxonomyNode {
  node_id: string
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

export const TaxonomyEditor = ({ initialNodes, disciplineId }: TaxonomyEditorProps) => {
  const [nodes, setNodes] = useState(initialNodes)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [parentIdForNew, setParentIdForNew] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)

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
    setEditingId(node.node_id)
    setEditingName(node.name)
  }

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return
    const targetId = editingId
    const newName = editingName.trim()
    const oldNodes = [...nodes]

    // Optimistic update
    setNodes(prev => prev.map(n =>
      n.node_id === targetId ? { ...n, name: newName } : n
    ))
    setEditingId(null)
    setEditingName('')

    const { error } = await updateTaxonomyNode(targetId, { name: newName })

    if (error) {
      setNodes(oldNodes) // Rollback
    }
  }

  const addRootNode = async () => {
    const { data, error } = await createTaxonomyNode({
      discipline_id: disciplineId,
      name: 'New Topic',
      level: 1,
      parent_id: null,
    })

    if (!error && data) {
      setNodes(prev => [...prev, data])
    }
  }

  const addChildNode = async (parentId: string, parentLevel: number, name: string) => {
    const level = parentLevel + 1
    const { data, error } = await createTaxonomyNode({
      discipline_id: disciplineId,
      name,
      level,
      parent_id: parentId,
    })

    if (!error && data) {
      setNodes(prev => [...prev, data])
      setExpandedIds(prev => new Set(prev).add(parentId))
    }

    setParentIdForNew(null)
  }

  const requestDelete = (id: string) => {
    setNodeToDelete(id)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!nodeToDelete) return
    const targetId = nodeToDelete
    const oldNodes = [...nodes]

    // Optimistic delete
    setNodes(prev => prev.filter(n => n.node_id !== targetId))
    setNodeToDelete(null)
    setShowDeleteDialog(false)

    const { error } = await deleteTaxonomyNode(targetId)

    if (error) {
      setNodes(oldNodes) // Rollback
    }
  }

  const renderNode = (node: TaxonomyNode, level: number = 0) => {
    const isExpanded = expandedIds.has(node.node_id)
    const isEditing = editingId === node.node_id
    const children = nodes.filter(n => n.parent_id === node.node_id)
    const hasChildren = children.length > 0 || node.level < 3

    return (
      <div key={node.node_id} className="min-w-0">
        <div
          className={cn(
            "flex items-center gap-2 py-1.5 px-3 hover:bg-muted/50 rounded-md group",
            level > 0 && "ml-6 border-l border-border/50"
          )}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(node.node_id)}
              className="p-0.5 hover:bg-muted rounded shrink-0"
            >
              {isExpanded ? (
                <SCIcon icon={CaretDown} size="sm" />
              ) : (
                <SCIcon icon={CaretRight} size="sm" />
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
                <SCIcon icon={XCircle} size="xs" />
              </button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-sm font-medium truncate">
                {node.name}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                L{node.level}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(node)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground"
                  title="Edit Name"
                >
                  <SCIcon icon={PencilSimple} size="xs" />
                </button>
                {node.level < 3 && (
                  <button
                    onClick={() => setParentIdForNew(node.node_id)}
                    className="p-1 hover:bg-muted rounded text-primary"
                    title="Add Child"
                  >
                    <SCIcon icon={Plus} size="xs" />
                  </button>
                )}
                <button
                  onClick={() => requestDelete(node.node_id)}
                  className="p-1 hover:bg-muted rounded text-red-600"
                  title="Delete Node"
                >
                  <SCIcon icon={Trash} size="xs" />
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
            {parentIdForNew === node.node_id && (
              <div className={cn("py-2", level >= 0 && "ml-12")}>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter child name..."
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        await addChildNode(node.node_id, node.level, e.currentTarget.value.trim())
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
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Taxonomy Tree</h2>
          <button
            onClick={addRootNode}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <SCIcon icon={Plus} size="sm" />
            Add Subject
          </button>
        </div>

        <div className="rounded-md border border-border bg-card">
          {nodes.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No taxonomy nodes found
            </div>
          ) : (
            <div className="p-4">
              {nodes
                .filter(n => !n.parent_id && n.node_id)
                .map(node => (
                  <div key={node.node_id || node.name} className="group">
                    {renderNode(node)}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete taxonomy node"
        description="This will permanently delete the node and cannot be undone."
        confirmLabel="Delete"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setNodeToDelete(null)}
      />
    </>
  )
}
