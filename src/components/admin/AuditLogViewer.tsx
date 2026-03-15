'use client'

import { useState, useEffect } from 'react'
import { Search, Download, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAuditLogs, type AuditLog } from '@/lib/audit/audit-queries'

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tableFilter, setTableFilter] = useState<string>('')
  const [eventFilter, setEventFilter] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    loadLogs()
  }, [tableFilter, eventFilter])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const data = await getAuditLogs({
        tableName: tableFilter || undefined,
        eventType: eventFilter || undefined,
        limit: 100,
      })
      setLogs(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchQuery 
      ? log.record_id.includes(searchQuery) || log.table_name.includes(searchQuery)
      : true
    return matchesSearch
  })

  const eventColors: Record<string, string> = {
    CREATE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    UPDATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    PUBLISH: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by table or record ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
          />
        </div>
        <select
          value={tableFilter}
          onChange={(e) => setTableFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Tables</option>
          <option value="questions">questions</option>
          <option value="wiki_articles">wiki_articles</option>
          <option value="models_3d">models_3d</option>
        </select>
        <select
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="">All Events</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="PUBLISH">PUBLISH</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="rounded-md border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            {error}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No audit logs found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left w-8"></th>
                <th className="px-4 py-3 text-left text-sm font-medium">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Event</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Table</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Record ID</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <>
                  <tr 
                    key={log.id} 
                    className="border-t hover:bg-muted/50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3">
                      {expandedId === log.id ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex px-2 py-0.5 rounded-full text-xs font-medium",
                        eventColors[log.event_type]
                      )}>
                        {log.event_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{log.table_name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-xs">
                      {log.record_id.slice(0, 8)}...
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="border-t bg-muted/30">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="text-sm">
                          <p className="font-medium mb-2">Changes:</p>
                          <pre className="bg-background p-3 rounded border overflow-x-auto text-xs">
                            {JSON.stringify(log.content_snapshot, null, 2)}
                          </pre>
                          {log.metadata && log.metadata.changed_fields && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Changed fields: {(log.metadata.changed_fields as string[]).join(', ')}
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
