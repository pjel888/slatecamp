'use client'

import { useState } from 'react'
import { Plus, CheckCircle, Warning, CircleNotch } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { importQuestionsForArticle } from '@/lib/actions/admin/content'
import { cn } from '@/lib/utils'

interface ArticleQuestionImporterProps {
  articleId: string
  topicId: string
  onImportComplete: (count: number) => void
}

type ImportStage = 'idle' | 'parsing' | 'validating' | 'importing' | 'success' | 'error'

export function ArticleQuestionImporter({ articleId, topicId, onImportComplete }: ArticleQuestionImporterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [stage, setStage] = useState<ImportStage>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const handleImport = async () => {
    if (!jsonInput.trim()) {
      setErrorMessage('Please paste JSON data')
      setStage('error')
      return
    }

    try {
      setStage('parsing')
      await delay(600)
      let parsed
      try {
        parsed = JSON.parse(jsonInput)
      } catch (e) {
        throw new Error('Invalid JSON format')
      }

      setStage('validating')
      await delay(800)
      if (!Array.isArray(parsed)) {
        throw new Error('Data must be a JSON array')
      }

      setStage('importing')
      const importResult = await importQuestionsForArticle(articleId, topicId, jsonInput)
      
      if (importResult.error) {
        throw new Error(importResult.error.message)
      } else {
        setCount(importResult.importedCount)
        setStage('success')
        setJsonInput('')
        onImportComplete(importResult.importedCount)
        setTimeout(() => {
          setIsOpen(false)
          setStage('idle')
        }, 2000)
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Import failed')
      setStage('error')
    }
  }

  const handleClose = () => {
    if (stage === 'parsing' || stage === 'validating' || stage === 'importing') return
    setIsOpen(false)
    setJsonInput('')
    setStage('idle')
    setErrorMessage(null)
  }

  const STAGE_LABELS: Record<ImportStage, string> = {
    idle: 'Import Questions',
    parsing: 'Parsing JSON...',
    validating: 'Validating Schema...',
    importing: 'Uploading to Database...',
    success: 'Import Successful',
    error: 'Import Failed'
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
              <Label htmlFor="json-input" className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                Questions JSON
              </Label>
              <Textarea
                id="json-input"
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                disabled={stage !== 'idle' && stage !== 'error'}
                placeholder='[{"questionStem": "...", "answerOptions": ["A","B","C","D"], "correctOption": "A", "rationale": "..."}]'
                className="font-mono text-[11px] min-h-[200px] mt-1.5 bg-surface-light border-border/60 focus:border-primary/40 transition-colors"
              />
            </div>

            {stage !== 'idle' && (
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-md border animate-in fade-in slide-in-from-top-2 duration-200",
                stage === 'error' ? "bg-red-50 border-red-100 text-red-700" :
                stage === 'success' ? "bg-green-50 border-green-100 text-green-700" :
                "bg-blue-50 border-blue-100 text-blue-700"
              )}>
                {(stage === 'parsing' || stage === 'validating' || stage === 'importing') ? (
                  <CircleNotch className="w-5 h-5 animate-spin" />
                ) : stage === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Warning className="w-5 h-5" />
                )}
                
                <div className="flex-1">
                  <p className="text-sm font-semibold">{STAGE_LABELS[stage]}</p>
                  {stage === 'error' && errorMessage && (
                    <p className="text-xs mt-0.5 opacity-80">{errorMessage}</p>
                  )}
                  {stage === 'success' && (
                    <p className="text-xs mt-0.5 opacity-80">Added {count} questions to this article.</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleClose} disabled={stage !== 'idle' && stage !== 'error' && stage !== 'success'}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              loading={stage === 'parsing' || stage === 'validating' || stage === 'importing'}
              disabled={!jsonInput.trim() || stage === 'success'}
              className="min-w-[140px]"
            >
              {stage === 'idle' || stage === 'error' ? 'Start Import' : STAGE_LABELS[stage]}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
