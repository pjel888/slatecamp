'use client'

import React, { useState, useEffect } from 'react'
import { MagnifyingGlass, DownloadSimple, CaretDown, CaretRight } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { getAuditLogsAction, type AuditLog } from '@/lib/audit/audit-actions'
import { EventBadge } from '@/components/shared/event-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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
      const data = await getAuditLogsAction({
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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <SCIcon icon={MagnifyingGlass} size="sm" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by table or record ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background"
          />
        </div>
        <Select value={tableFilter} onValueChange={setTableFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Tables" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tables</SelectItem>
            <SelectItem value="questions">questions</SelectItem>
            <SelectItem value="wiki_articles">wiki_articles</SelectItem>
            <SelectItem value="taxonomy_tree">taxonomy_tree</SelectItem>
            <SelectItem value="models_3d">models_3d</SelectItem>
          </SelectContent>
        </Select>
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger>
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Events</SelectItem>
            <SelectItem value="CREATE">CREATE</SelectItem>
            <SelectItem value="UPDATE">UPDATE</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
            <SelectItem value="PUBLISH">PUBLISH</SelectItem>
          </SelectContent>
        </Select>
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
                <React.Fragment key={log.id}>
                  <tr
                    className="border-t hover:bg-muted/50 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3">
                      {expandedId === log.id ? (
                        <SCIcon icon={CaretDown} size="sm" />
                      ) : (
                        <SCIcon icon={CaretRight} size="sm" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <EventBadge eventType={log.event_type} />
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
                          <div className="mt-4">
                            {log.table_name === 'questions' && log.event_type !== 'DELETE' && (
                              <a
                                href={`/admin/knowledge/questions/${log.record_id}`}
                                className="text-xs text-camp-cobalt hover:underline font-medium"
                              >
                                View Question in Context &rarr;
                              </a>
                            )}
                            {log.table_name === 'wiki_articles' && log.event_type !== 'DELETE' && (
                              <a
                                href={`/admin/knowledge/${log.record_id}`}
                                className="text-xs text-camp-cobalt hover:underline font-medium"
                              >
                                View Article in Editor &rarr;
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
