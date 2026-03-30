'use client'

import { useState, useCallback } from 'react'
import { Plus, UploadSimple, X, CheckCircle, Warning, FileText } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { importQuestionsForArticle } from '@/lib/actions/admin/content'

interface ArticleQuestionImporterProps {
  articleId: string
  topicId: string
  onImportComplete: (count: number) => void
}

export function ArticleQuestionImporter({ articleId, topicId, onImportComplete }: ArticleQuestionImporterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      setResult({ success: false, message: 'Please paste JSON data' })
      return
    }

    setIsImporting(true)
    setResult(null)

    try {
      const importResult = await importQuestionsForArticle(articleId, topicId, jsonInput)
      
      if (importResult.error) {
        setResult({ success: false, message: importResult.error.message })
      } else {
        setResult({ success: true, message: `Successfully imported ${importResult.importedCount} questions` })
        setJsonInput('')
        onImportComplete(importResult.importedCount)
        setTimeout(() => {
          setIsOpen(false)
          setResult(null)
        }, 1500)
      }
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : 'Import failed' })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setJsonInput('')
    setResult(null)
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-1.5" />
        Import Questions
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Questions for Article</DialogTitle>
            <DialogDescription>
              Paste JSON array of questions. Each question should have: questionStem, answerOptions, correctOption, rationale.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="json-input">Questions JSON</Label>
              <Textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='[{"questionStem": "...", "answerOptions": ["A","B","C","D"], "correctOption": "A", "rationale": "..."}]'
                className="font-mono text-sm min-h-[200px]"
              />
            </div>

            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {result.success ? <CheckCircle className="w-5 h-5" /> : <Warning className="w-5 h-5" />}
                <span className="text-sm">{result.message}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={isImporting || !jsonInput.trim()}>
              {isImporting ? 'Importing...' : 'Import Questions'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
