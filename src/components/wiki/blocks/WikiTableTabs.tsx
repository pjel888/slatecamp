'use client'

import { useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { parseMdxProp } from '../shared/parse-mdx-prop'

type WikiTableTabInput = {
  id: string
  title: string
  content: string
}

type WikiTableTabsProps = {
  tables: WikiTableTabInput[] | string
  defaultTab?: string
  caption?: string
  ariaLabel?: string
}

type ParsedTable = {
  headers: string[]
  rows: string[][]
}

type RowData = Record<string, string>

function splitMarkdownRow(row: string) {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function isSeparatorRow(row: string) {
  const cells = splitMarkdownRow(row)
  return cells.length > 0 && cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function parseMarkdownTable(content: string): ParsedTable | null {
  const lines = content
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const tableLines = lines.filter((line) => line.includes('|'))
  const headerLine = tableLines.find((line) => !isSeparatorRow(line))
  if (!headerLine) return null

  const headers = splitMarkdownRow(headerLine).filter(Boolean)
  if (!headers.length) return null

  const bodyRows = tableLines
    .slice(tableLines.indexOf(headerLine) + 1)
    .filter((line) => !isSeparatorRow(line))
    .map((line) => {
      const cells = splitMarkdownRow(line)
      return headers.map((_, index) => cells[index] ?? '')
    })
    .filter((cells) => cells.some(Boolean))

  if (!bodyRows.length) return null
  return { headers, rows: bodyRows }
}

function toTanstackData(parsed: ParsedTable) {
  return parsed.rows.map((row) =>
    parsed.headers.reduce<RowData>((record, header, index) => {
      record[`col_${index}`] = row[index] ?? ''
      return record
    }, {}),
  )
}

function toTanstackColumns(parsed: ParsedTable): ColumnDef<RowData>[] {
  return parsed.headers.map((header, index) => ({
    accessorKey: `col_${index}`,
    header,
    cell: (info) => String(info.getValue() ?? ''),
  }))
}

function WikiTablePanel({ table }: { table: WikiTableTabInput }) {
  const parsed = useMemo(() => parseMarkdownTable(table.content), [table.content])
  const data = useMemo(() => (parsed ? toTanstackData(parsed) : []), [parsed])
  const columns = useMemo(() => (parsed ? toTanstackColumns(parsed) : []), [parsed])

  // TanStack Table intentionally returns table-instance helpers; this component does not pass
  // them into memoized child components.
  // eslint-disable-next-line react-hooks/incompatible-library
  const reactTable = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!parsed) {
    return (
      <div className="rounded-md border border-dashed border-wiki-border bg-muted/30 p-4 text-sm text-muted-foreground">
        Table content could not be parsed. Use a standard Markdown table with a header row and separator row.
      </div>
    )
  }

  return (
    <div>
      <div
        className="hidden overflow-hidden rounded-md border border-wiki-border bg-card dark:border-wiki-invert-divider dark:bg-wiki-surface-dark md:block"
        role="table"
        aria-label={table.title}
      >
        {reactTable.getHeaderGroups().map((headerGroup) => (
          <div
            key={headerGroup.id}
            className="grid bg-[var(--wiki-row-light)] dark:bg-wiki-surface-dark"
            role="row"
            style={{ gridTemplateColumns: `repeat(${parsed.headers.length}, minmax(9rem, 1fr))` }}
          >
            {headerGroup.headers.map((header) => (
              <div
                key={header.id}
                className="border-b border-wiki-border px-3 py-2 font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest text-wiki-muted dark:border-wiki-invert-divider"
                role="columnheader"
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </div>
            ))}
          </div>
        ))}

        <div role="rowgroup">
          {reactTable.getRowModel().rows.map((row) => (
            <div
              key={row.id}
              className="grid border-b border-wiki-border last:border-b-0 dark:border-wiki-invert-divider"
              role="row"
              style={{ gridTemplateColumns: `repeat(${parsed.headers.length}, minmax(9rem, 1fr))` }}
            >
              {row.getVisibleCells().map((cell) => (
                <div
                  key={cell.id}
                  className="px-3 py-[11px] text-sm leading-relaxed text-wiki-body dark:text-wiki-invert-body"
                  role="cell"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {reactTable.getRowModel().rows.map((row, rowIndex) => (
          <div
            key={row.id}
            className="rounded-md border border-wiki-border bg-card p-3 dark:border-wiki-invert-divider dark:bg-wiki-surface-dark"
            aria-label={`${table.title} row ${rowIndex + 1}`}
          >
            {row.getVisibleCells().map((cell, cellIndex) => (
              <div
                key={cell.id}
                className={cn(
                  'grid grid-cols-[7.5rem_1fr] gap-3 py-2 text-sm first:pt-0 last:pb-0',
                  cellIndex !== row.getVisibleCells().length - 1 &&
                    'border-b border-wiki-border/70 dark:border-wiki-invert-divider',
                )}
              >
                <span className="font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-widest text-wiki-muted">
                  {parsed.headers[cellIndex]}
                </span>
                <span className="leading-relaxed text-wiki-body dark:text-wiki-invert-body">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export function WikiTableTabs({
  tables: rawTables,
  defaultTab,
  caption,
  ariaLabel = 'Article comparison tables',
}: WikiTableTabsProps) {
  const tables = parseMdxProp<WikiTableTabInput[]>(rawTables, [])
  const validTables = tables.filter((table) => table.id && table.title && table.content)

  if (!validTables.length) return null

  return (
    <section className="not-prose my-6 overflow-hidden rounded-lg border border-wiki-border bg-background dark:border-wiki-invert-divider">
      {caption && (
        <p className="border-b border-wiki-border bg-muted px-3 py-2.5 text-xs font-semibold text-wiki-ink dark:border-wiki-invert-divider dark:bg-[var(--wiki-panel-dark-alt)] dark:text-wiki-invert-heading">
          {caption}
        </p>
      )}

      <Tabs defaultValue={defaultTab || validTables[0].id} className="w-full gap-0">
        <div className="border-b border-wiki-border bg-muted/70 px-3 py-2 dark:border-wiki-invert-divider dark:bg-wiki-surface-dark">
          <TabsList
            aria-label={ariaLabel}
            className="flex w-full flex-wrap justify-start gap-1"
            variant="segmented"
          >
            {validTables.map((table) => (
              <TabsTrigger key={table.id} value={table.id} className="flex-none text-xs">
                {table.title}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {validTables.map((table) => (
          <TabsContent key={table.id} value={table.id} className="p-3 sm:p-4">
            <WikiTablePanel table={table} />
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
