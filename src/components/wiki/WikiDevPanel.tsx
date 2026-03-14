'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { FolderCog, Plus, Pencil, Trash2, X, Link2 } from 'lucide-react'
import { useDraggableFloatingPosition } from '@/lib/hooks/useDraggableFloatingPosition'
import {
  createWikiCategory,
  updateWikiCategory,
  deleteWikiCategory,
} from '@/lib/actions/wiki-categories'
import {
  createWikiPage,
  updateWikiPage,
  deleteWikiPage,
  createWikiPageLink,
  deleteWikiPageLink,
  getWikiPageForEdit,
  type WikiPageStub,
} from '@/lib/actions/wiki-pages'
import { PendingButton } from '@/components/ui/button'
import { WikiRichEditor } from '@/components/wiki/WikiRichEditor'
import type { WikiCategory } from '@/types/app'

const DEFAULT_RIGHT = 220
const DEFAULT_BOTTOM = 16

function flattenTree(
  tree: WikiCategory[],
  depth = 0,
): { id: string; name: string; slug: string; depth: number }[] {
  const out: { id: string; name: string; slug: string; depth: number }[] = []
  for (const node of tree) {
    out.push({ id: node.id, name: node.name, slug: node.slug, depth })
    if (node.children?.length) {
      out.push(...flattenTree(node.children, depth + 1))
    }
  }
  return out
}

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

type TabId = 'categories' | 'pages'

interface WikiDevPanelProps {
  tree: WikiCategory[]
  allPagesStubs: WikiPageStub[]
  isDevMode: boolean
}

export function WikiDevPanel({
  tree,
  allPagesStubs,
  isDevMode,
}: WikiDevPanelProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<TabId>('categories')
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editOrder, setEditOrder] = useState(0)
  const [addName, setAddName] = useState('')
  const [addSlug, setAddSlug] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addOrder, setAddOrder] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Pages tab
  const [pageFormMode, setPageFormMode] = useState<'add' | 'edit' | null>(null)
  const [editPageId, setEditPageId] = useState<string | null>(null)
  const [editPageData, setEditPageData] = useState<{
    page: {
      id: string
      title: string
      slug: string
      markdown_content: string
      tags: string[]
      is_free: boolean
      order_index: number
      category_id: string
    }
    backlinks: WikiPageStub[]
    forwardLinks: WikiPageStub[]
  } | null>(null)
  const [pageCategoryId, setPageCategoryId] = useState('')
  const [pageTitle, setPageTitle] = useState('')
  const [pageSlug, setPageSlug] = useState('')
  const [pageMarkdown, setPageMarkdown] = useState('')
  const [pageTagsStr, setPageTagsStr] = useState('')
  const [pageIsFree, setPageIsFree] = useState(true)
  const [pageOrder, setPageOrder] = useState(0)
  const [linkTargetId, setLinkTargetId] = useState('')
  const [addLinkBidirectional, setAddLinkBidirectional] = useState(true)

  const flat = flattenTree(tree)
  const selectedChildren =
    selectedParentId == null
      ? tree
      : (() => {
          function findChildren(
            nodes: WikiCategory[],
            parentId: string,
          ): WikiCategory[] {
            for (const n of nodes) {
              if (n.id === parentId) return n.children ?? []
              const inChild = findChildren(n.children ?? [], parentId)
              if (inChild.length) return inChild
            }
            return []
          }
          return findChildren(tree, selectedParentId)
        })()

  const selectedParentLabel =
    selectedParentId == null
      ? '(root)'
      : (flat.find((c) => c.id === selectedParentId)?.name ?? selectedParentId)

  const {
    style: floatStyle,
    onPointerDown: onDrag,
    didDragRef,
  } = useDraggableFloatingPosition(
    'wiki-categories',
    DEFAULT_RIGHT,
    DEFAULT_BOTTOM,
  )

  function startEdit(cat: WikiCategory) {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditSlug(cat.slug)
    setEditDescription(cat.description ?? '')
    setEditOrder(cat.order_index)
  }

  function cancelEdit() {
    setEditingId(null)
    setError(null)
  }

  async function handleUpdate() {
    if (!editingId) return
    setError(null)
    startTransition(async () => {
      try {
        await updateWikiCategory(editingId, {
          name: editName,
          slug: editSlug,
          description: editDescription || null,
          order_index: editOrder,
        })
        cancelEdit()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Update failed')
      }
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category? Child categories will become root.'))
      return
    setError(null)
    startTransition(async () => {
      try {
        await deleteWikiCategory(id)
        if (editingId === id) cancelEdit()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  async function handleCreate() {
    const name = addName.trim()
    const slug = addSlug.trim() || slugFromName(addName)
    if (!name) {
      setError('Name is required')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        await createWikiCategory({
          parent_id: selectedParentId,
          name,
          slug,
          description: addDescription.trim() || null,
          order_index: addOrder,
        })
        setAddName('')
        setAddSlug('')
        setAddDescription('')
        setAddOrder(selectedChildren.length)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Create failed')
      }
    })
  }

  function openAddPage() {
    setPageFormMode('add')
    setEditPageId(null)
    setEditPageData(null)
    setPageCategoryId(tree[0]?.id ?? '')
    setPageTitle('')
    setPageSlug('')
    setPageMarkdown('')
    setPageTagsStr('')
    setPageIsFree(true)
    setPageOrder(allPagesStubs.length)
  }

  function closePageForm() {
    setPageFormMode(null)
    setEditPageId(null)
    setEditPageData(null)
  }

  function openEditPage(stub: WikiPageStub) {
    setPageFormMode('edit')
    setEditPageId(stub.id)
    setEditPageData(null)
    setLinkTargetId('')
    startTransition(async () => {
      try {
        const data = await getWikiPageForEdit(stub.id)
        if (!data.page) return
        setEditPageData({
          page: data.page!,
          backlinks: data.backlinks,
          forwardLinks: data.forwardLinks,
        })
        setPageCategoryId(data.page.category_id)
        setPageTitle(data.page.title)
        setPageSlug(data.page.slug)
        setPageMarkdown(data.page.markdown_content)
        setPageTagsStr(data.page.tags.join(', '))
        setPageIsFree(data.page.is_free)
        setPageOrder(data.page.order_index)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load page')
      }
    })
  }

  async function handleSavePage() {
    const title = pageTitle.trim()
    const slug = pageSlug.trim() || slugFromName(pageTitle)
    const tags = pageTagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (!title) {
      setError('Title is required')
      return
    }
    if (!pageCategoryId) {
      setError('Category is required')
      return
    }
    setError(null)
    startTransition(async () => {
      try {
        if (pageFormMode === 'add') {
          await createWikiPage({
            category_id: pageCategoryId,
            title,
            slug,
            markdown_content: pageMarkdown,
            tags,
            is_free: pageIsFree,
            order_index: pageOrder,
          })
          closePageForm()
        } else if (editPageId) {
          await updateWikiPage(editPageId, {
            category_id: pageCategoryId,
            title,
            slug,
            markdown_content: pageMarkdown,
            tags,
            is_free: pageIsFree,
            order_index: pageOrder,
          })
          closePageForm()
        }
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Save failed')
      }
    })
  }

  async function handleDeletePage(id: string) {
    if (!confirm('Delete this page? Links to/from it will be removed.')) return
    setError(null)
    startTransition(async () => {
      try {
        await deleteWikiPage(id)
        closePageForm()
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  async function handleAddLink() {
    if (!editPageId || !linkTargetId) return
    setError(null)
    startTransition(async () => {
      try {
        await createWikiPageLink(editPageId, linkTargetId)
        if (addLinkBidirectional)
          await createWikiPageLink(linkTargetId, editPageId)
        setLinkTargetId('')
        const data = await getWikiPageForEdit(editPageId)
        if (data.page) {
          setEditPageData({
            page: data.page!,
            backlinks: data.backlinks,
            forwardLinks: data.forwardLinks,
          })
        }
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Add link failed')
      }
    })
  }

  async function handleRemoveLink(sourceId: string, targetId: string) {
    setError(null)
    startTransition(async () => {
      try {
        await deleteWikiPageLink(sourceId, targetId)
        if (editPageId) {
          const data = await getWikiPageForEdit(editPageId)
          if (data.page) {
            setEditPageData({
              page: data.page!,
              backlinks: data.backlinks,
              forwardLinks: data.forwardLinks,
            })
          }
        }
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Remove link failed')
      }
    })
  }

  const flatCategories = flattenTree(tree)
  const pagesByCategoryId = allPagesStubs.reduce(
    (acc, p) => {
      if (!acc[p.category_id]) acc[p.category_id] = []
      acc[p.category_id].push(p)
      return acc
    },
    {} as Record<string, WikiPageStub[]>,
  )

  if (!isDevMode) return null

  return (
    <>
      {/* Trigger — draggable, default position left of dev toolbar with gap */}
      <button
        type='button'
        onClick={() => {
          if (didDragRef.current) {
            didDragRef.current = false
            return
          }
          setOpen(true)
        }}
        style={floatStyle}
        onPointerDown={onDrag}
        className='z-40 flex cursor-grab active:cursor-grabbing items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-secondary select-none'
        title='Wiki categories (dev) — drag to move'
      >
        <FolderCog
          className='h-4 w-4 text-muted-foreground'
          strokeWidth={1.5}
        />
        <span className='text-xs font-medium text-foreground'>Categories</span>
      </button>

      {/* Panel overlay */}
      {open && (
        <div
          className='fixed inset-0 z-50 bg-black/20 transition-opacity duration-150'
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md border-l border-border bg-background shadow-xl transition-transform duration-150 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex h-full flex-col'>
          <div className='flex items-center justify-between border-b border-border px-4 py-3'>
            <div className='flex items-center gap-2'>
              <h2 className='text-sm font-semibold text-foreground'>
                Wiki (dev)
              </h2>
              <div className='flex rounded-sm border border-border p-0.5'>
                <button
                  type='button'
                  onClick={() => setTab('categories')}
                  className={`rounded-sm px-2 py-1 text-[11px] font-medium transition-colors ${
                    tab === 'categories'
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Categories
                </button>
                <button
                  type='button'
                  onClick={() => setTab('pages')}
                  className={`rounded-sm px-2 py-1 text-[11px] font-medium transition-colors ${
                    tab === 'pages'
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Pages
                </button>
              </div>
            </div>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
              aria-label='Close panel'
            >
              <X className='h-4 w-4' strokeWidth={1.5} />
            </button>
          </div>

          <div className='flex-1 overflow-y-auto p-4 space-y-6'>
            {error && (
              <div className='rounded-sm border border-color-signal-red/40 bg-color-signal-red/5 px-3 py-2 text-xs text-color-signal-red'>
                {error}
              </div>
            )}

            {tab === 'categories' && (
              <>
                {/* Parent selector */}
                <div>
                  <label className='mb-1.5 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground'>
                    Add under category
                  </label>
                  <select
                    value={selectedParentId ?? ''}
                    onChange={(e) =>
                      setSelectedParentId(e.target.value || null)
                    }
                    className='w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px] text-foreground'
                  >
                    <option value=''>(root)</option>
                    {flat.map((c) => (
                      <option key={c.id} value={c.id}>
                        {'—'.repeat(c.depth)} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Add form */}
                <div className='rounded-sm border border-border p-3 space-y-3'>
                  <h3 className='text-xs font-semibold text-foreground'>
                    Add subcategory under {selectedParentLabel}
                  </h3>
                  <input
                    type='text'
                    placeholder='Name'
                    value={addName}
                    onChange={(e) => {
                      setAddName(e.target.value)
                      if (!addSlug) setAddSlug(slugFromName(e.target.value))
                    }}
                    className='w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground'
                  />
                  <input
                    type='text'
                    placeholder='Slug (optional)'
                    value={addSlug}
                    onChange={(e) => setAddSlug(e.target.value)}
                    className='w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground'
                  />
                  <input
                    type='text'
                    placeholder='Description (optional)'
                    value={addDescription}
                    onChange={(e) => setAddDescription(e.target.value)}
                    className='w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground'
                  />
                  <div className='flex items-center gap-2'>
                    <label className='text-[11px] text-muted-foreground'>
                      Order:
                    </label>
                    <input
                      type='number'
                      min={0}
                      value={addOrder}
                      onChange={(e) => setAddOrder(Number(e.target.value) || 0)}
                      className='w-20 rounded border border-border bg-background px-2 py-1 text-[13px]'
                    />
                  </div>
                  <PendingButton
                    type='button'
                    onClick={handleCreate}
                    pending={isPending}
                    pendingLabel='Adding...'
                    className='flex items-center gap-1.5 rounded-sm bg-(--color-signal-blue) px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90'
                  >
                    <Plus className='h-3.5 w-3.5' strokeWidth={1.5} />
                    Add subcategory
                  </PendingButton>
                </div>

                {/* Children list: edit / delete */}
                <div>
                  <h3 className='mb-2 text-xs font-semibold text-foreground'>
                    Subcategories under {selectedParentLabel}
                  </h3>
                  {selectedChildren.length === 0 ? (
                    <p className='text-[12px] text-muted-foreground'>
                      No subcategories yet.
                    </p>
                  ) : (
                    <ul className='space-y-1'>
                      {selectedChildren.map((cat) => (
                        <li
                          key={cat.id}
                          className='rounded-sm border border-border/60 bg-secondary/30 p-2'
                        >
                          {editingId === cat.id ? (
                            <div className='space-y-2'>
                              <input
                                type='text'
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className='w-full rounded border border-border bg-background px-2 py-1.5 text-[13px]'
                              />
                              <input
                                type='text'
                                value={editSlug}
                                onChange={(e) => setEditSlug(e.target.value)}
                                className='w-full rounded border border-border bg-background px-2 py-1.5 text-[13px]'
                              />
                              <input
                                type='text'
                                value={editDescription}
                                onChange={(e) =>
                                  setEditDescription(e.target.value)
                                }
                                placeholder='Description'
                                className='w-full rounded border border-border bg-background px-2 py-1.5 text-[13px]'
                              />
                              <div className='flex items-center gap-2'>
                                <input
                                  type='number'
                                  min={0}
                                  value={editOrder}
                                  onChange={(e) =>
                                    setEditOrder(Number(e.target.value) || 0)
                                  }
                                  className='w-16 rounded border border-border bg-background px-2 py-1 text-[13px]'
                                />
                                <PendingButton
                                  type='button'
                                  onClick={handleUpdate}
                                  pending={isPending}
                                  pendingLabel='Saving...'
                                  className='rounded bg-(--color-signal-blue) px-2 py-1 text-[11px] font-medium text-white'
                                >
                                  Save
                                </PendingButton>
                                <button
                                  type='button'
                                  onClick={cancelEdit}
                                  className='rounded border border-border px-2 py-1 text-[11px] text-muted-foreground'
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className='flex items-center justify-between gap-2'>
                              <div className='min-w-0'>
                                <p className='truncate text-[13px] font-medium text-foreground'>
                                  {cat.name}
                                </p>
                                <p className='truncate text-[11px] text-muted-foreground'>
                                  {cat.slug}
                                </p>
                              </div>
                              <div className='flex shrink-0 gap-1'>
                                <button
                                  type='button'
                                  onClick={() => startEdit(cat)}
                                  className='rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
                                  title='Edit'
                                >
                                  <Pencil
                                    className='h-3.5 w-3.5'
                                    strokeWidth={1.5}
                                  />
                                </button>
                                <PendingButton
                                  type='button'
                                  onClick={() => handleDelete(cat.id)}
                                  pending={isPending}
                                  pendingLabel='...'
                                  className='rounded p-1.5 text-muted-foreground transition-colors hover:bg-color-signal-red/10 hover:text-color-signal-red'
                                  title='Delete'
                                >
                                  <Trash2
                                    className='h-3.5 w-3.5'
                                    strokeWidth={1.5}
                                  />
                                </PendingButton>
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}

            {tab === 'pages' && (
              <>
                <div className='flex items-center justify-between'>
                  <h3 className='text-xs font-semibold text-foreground'>
                    Pages
                  </h3>
                  <button
                    type='button'
                    onClick={openAddPage}
                    className='flex items-center gap-1 rounded-sm bg-(--color-signal-blue) px-2 py-1.5 text-[11px] font-medium text-white'
                  >
                    <Plus className='h-3 w-3' strokeWidth={1.5} />
                    Add page
                  </button>
                </div>

                {pageFormMode && (
                  <div className='space-y-4 rounded-sm border border-border p-3'>
                    <h3 className='text-xs font-semibold text-foreground'>
                      {pageFormMode === 'add' ? 'New page' : 'Edit page'}
                    </h3>
                    {pageFormMode === 'edit' && !editPageData && isPending && (
                      <p className='text-[12px] text-muted-foreground'>
                        Loading...
                      </p>
                    )}
                    {(pageFormMode === 'add' || editPageData) && (
                      <>
                        <div>
                          <label className='mb-1 block text-[10px] text-muted-foreground'>
                            Category
                          </label>
                          <select
                            value={pageCategoryId}
                            onChange={(e) => setPageCategoryId(e.target.value)}
                            className='w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px]'
                          >
                            {flatCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {'—'.repeat(c.depth)} {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <input
                          type='text'
                          placeholder='Title'
                          value={pageTitle}
                          onChange={(e) => {
                            setPageTitle(e.target.value)
                            if (!pageSlug && pageFormMode === 'add')
                              setPageSlug(slugFromName(e.target.value))
                          }}
                          className='w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px]'
                        />
                        <input
                          type='text'
                          placeholder='Slug'
                          value={pageSlug}
                          onChange={(e) => setPageSlug(e.target.value)}
                          className='w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px]'
                        />
                        <div>
                          <label className='mb-1 block text-[10px] text-muted-foreground'>
                            Content (markdown)
                          </label>
                          <WikiRichEditor
                            value={pageMarkdown}
                            onChange={setPageMarkdown}
                            minHeight='180px'
                          />
                        </div>
                        <input
                          type='text'
                          placeholder='Tags (comma-separated)'
                          value={pageTagsStr}
                          onChange={(e) => setPageTagsStr(e.target.value)}
                          className='w-full rounded-sm border border-border bg-background px-3 py-2 text-[13px]'
                        />
                        <div className='flex flex-wrap items-center gap-3'>
                          <label className='flex items-center gap-1.5 text-[12px]'>
                            <input
                              type='checkbox'
                              checked={pageIsFree}
                              onChange={(e) => setPageIsFree(e.target.checked)}
                            />
                            Free
                          </label>
                          <label className='text-[11px] text-muted-foreground'>
                            Order:
                          </label>
                          <input
                            type='number'
                            min={0}
                            value={pageOrder}
                            onChange={(e) =>
                              setPageOrder(Number(e.target.value) || 0)
                            }
                            className='w-16 rounded border border-border bg-background px-2 py-1 text-[13px]'
                          />
                        </div>
                        <div className='flex gap-2'>
                          <PendingButton
                            type='button'
                            onClick={handleSavePage}
                            pending={isPending}
                            pendingLabel={
                              pageFormMode === 'add'
                                ? 'Creating...'
                                : 'Saving...'
                            }
                            className='rounded-sm bg-(--color-signal-blue) px-3 py-2 text-[12px] font-medium text-white'
                          >
                            {pageFormMode === 'add' ? 'Create page' : 'Save'}
                          </PendingButton>
                          {pageFormMode === 'edit' && editPageId && (
                            <PendingButton
                              type='button'
                              onClick={() => handleDeletePage(editPageId)}
                              pending={isPending}
                              pendingLabel='Deleting...'
                              className='rounded-sm border border-color-signal-red/40 px-3 py-2 text-[12px] text-color-signal-red hover:bg-color-signal-red/10'
                            >
                              Delete
                            </PendingButton>
                          )}
                          <button
                            type='button'
                            onClick={closePageForm}
                            className='rounded-sm border border-border px-3 py-2 text-[12px] text-muted-foreground'
                          >
                            Cancel
                          </button>
                        </div>

                        {pageFormMode === 'edit' && editPageData && (
                          <div className='mt-4 border-t border-border pt-4 space-y-3'>
                            <h4 className='text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1'>
                              <Link2 className='h-3 w-3' strokeWidth={1.5} />
                              Page links
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              <select
                                value={linkTargetId}
                                onChange={(e) =>
                                  setLinkTargetId(e.target.value)
                                }
                                className='rounded border border-border bg-background px-2 py-1 text-[12px]'
                              >
                                <option value=''>Add link to...</option>
                                {allPagesStubs
                                  .filter((p) => p.id !== editPageId)
                                  .map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.title}
                                    </option>
                                  ))}
                              </select>
                              <label className='flex items-center gap-1 text-[11px] text-muted-foreground'>
                                <input
                                  type='checkbox'
                                  checked={addLinkBidirectional}
                                  onChange={(e) =>
                                    setAddLinkBidirectional(e.target.checked)
                                  }
                                />
                                Bi-directional
                              </label>
                              <PendingButton
                                type='button'
                                onClick={handleAddLink}
                                disabled={!linkTargetId}
                                pending={isPending}
                                pendingLabel='Adding...'
                                className='rounded bg-secondary px-2 py-1 text-[11px]'
                              >
                                Add
                              </PendingButton>
                            </div>
                            <div className='space-y-1.5'>
                              {editPageData.forwardLinks.length > 0 && (
                                <>
                                  <p className='text-[10px] text-muted-foreground'>
                                    Links to:
                                  </p>
                                  <ul className='space-y-1'>
                                    {editPageData.forwardLinks.map((p) => (
                                      <li
                                        key={p.id}
                                        className='flex items-center justify-between gap-2 rounded bg-secondary/50 px-2 py-1 text-[12px]'
                                      >
                                        <span className='truncate'>
                                          {p.title}
                                        </span>
                                        <button
                                          type='button'
                                          onClick={() =>
                                            handleRemoveLink(editPageId!, p.id)
                                          }
                                          className='shrink-0 text-color-signal-red hover:underline'
                                        >
                                          Remove
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                              {editPageData.backlinks.length > 0 && (
                                <>
                                  <p className='text-[10px] text-muted-foreground mt-2'>
                                    Backlinks:
                                  </p>
                                  <ul className='space-y-1'>
                                    {editPageData.backlinks.map((p) => (
                                      <li
                                        key={p.id}
                                        className='flex items-center justify-between gap-2 rounded bg-secondary/50 px-2 py-1 text-[12px]'
                                      >
                                        <span className='truncate'>
                                          {p.title}
                                        </span>
                                        <button
                                          type='button'
                                          onClick={() =>
                                            handleRemoveLink(p.id, editPageId!)
                                          }
                                          className='shrink-0 text-color-signal-red hover:underline'
                                        >
                                          Remove
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                <div>
                  <h3 className='mb-2 text-xs font-semibold text-foreground'>
                    All pages by category
                  </h3>
                  {flatCategories.length === 0 ? (
                    <p className='text-[12px] text-muted-foreground'>
                      No categories yet. Add one in the Categories tab.
                    </p>
                  ) : (
                    <ul className='space-y-3'>
                      {flatCategories.map((cat) => {
                        const pages = pagesByCategoryId[cat.id] ?? []
                        return (
                          <li key={cat.id}>
                            <p className='text-[11px] font-medium text-muted-foreground mb-1'>
                              {cat.name}
                            </p>
                            {pages.length === 0 ? (
                              <p className='text-[11px] text-muted-foreground/80 pl-2'>
                                No pages
                              </p>
                            ) : (
                              <ul className='space-y-0.5'>
                                {pages.map((p) => (
                                  <li
                                    key={p.id}
                                    className='flex items-center justify-between gap-2 rounded border border-border/60 bg-secondary/30 px-2 py-1.5'
                                  >
                                    <span className='truncate text-[13px]'>
                                      {p.title}
                                    </span>
                                    <div className='flex shrink-0 gap-1'>
                                      <button
                                        type='button'
                                        onClick={() => openEditPage(p)}
                                        className='rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        title='Edit'
                                      >
                                        <Pencil
                                          className='h-3.5 w-3.5'
                                          strokeWidth={1.5}
                                        />
                                      </button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
