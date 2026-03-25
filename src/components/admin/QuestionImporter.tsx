'use client'

import { useState, useCallback } from 'react'
import { UploadSimple, FileText, Warning, CheckCircle, DownloadSimple, XCircle } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import { 
  parseCSV, 
  parseJSON, 
  getQuestionsFromCSV,
  getQuestionsFromJSON,
  type ImportError 
} from '@/lib/import/question-importer'
import { importQuestionsToDb } from '@/lib/import/import-actions'
import { type QuestionCSV, type QuestionJSON } from '@/lib/import/question-schema'

type ImportFormat = 'csv' | 'json'

export function QuestionImporter() {
  const [file, setFile] = useState<File | null>(null)
  const [format, setFormat] = useState<ImportFormat>('csv')
  const [isValidating, setIsValidating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    validCount: number
    errors: ImportError[]
    imported?: boolean
    importError?: string
  } | null>(null)
  const [questions, setQuestions] = useState<(QuestionCSV | QuestionJSON)[]>([])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.json'))) {
      setFile(droppedFile)
      setResult(null)
      setQuestions([])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setResult(null)
      setQuestions([])
    }
  }, [])

  const handleValidate = async () => {
    if (!file) return
    
    setIsValidating(true)
    setResult(null)
    
    try {
      const parseResult = format === 'csv' 
        ? await parseCSV(file)
        : await parseJSON(file)
      
      // Store questions for import
      if (parseResult.success) {
        const q = format === 'csv' 
          ? await getQuestionsFromCSV(file)
          : await getQuestionsFromJSON(file)
        setQuestions(q)
      }
      
      setResult(parseResult)
    } catch (error) {
      setResult({
        success: false,
        validCount: 0,
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Unknown error' }],
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleImport = async () => {
    if (questions.length === 0) return
    
    setIsImporting(true)
    
    try {
      const importResult = await importQuestionsToDb(questions)
      setResult(prev => prev ? {
        ...prev,
        imported: importResult.success,
        importError: importResult.error,
      } : null)
    } catch (error) {
      setResult(prev => prev ? {
        ...prev,
        imported: false,
        importError: error instanceof Error ? error.message : 'Unknown error',
      } : null)
    } finally {
      setIsImporting(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setResult(null)
    setQuestions([])
  }

  const downloadCSVTemplate = () => {
    const template = 'taxonomy_node_id,question_text,option_a,option_b,option_c,option_d,option_e,correct_answer,rationale,difficulty\n00000000-0000-0000-0000-000000000001,"What is the primary function of a column in a structure?","To resist compressive loads","To provide aesthetic appeal","To hold drywall","To create openings","","a","Columns transfer loads from beams to foundations",3'
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'question_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadJSONTemplate = () => {
    const template = {
      questions: [
        {
          taxonomy_node_id: "00000000-0000-0000-0000-000000000001",
          question_text: "What is the primary function of a column in a structure?",
          options: ["To resist compressive loads", "To provide aesthetic appeal", "To hold drywall", "To create openings"],
          correct_answer: "a",
          rationale: "Columns transfer loads from beams to foundations",
          difficulty: 3
        }
      ]
    }
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'question_template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => { setFormat('csv'); setFile(null); setResult(null) }}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            format === 'csv' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          CSV
        </button>
        <button
          onClick={() => { setFormat('json'); setFile(null); setResult(null) }}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
            format === 'json' 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          JSON
        </button>
      </div>

      {/* Template Download */}
      <div className="flex gap-3">
        <button
          onClick={downloadCSVTemplate}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <SCIcon icon={DownloadSimple} size="sm" />
          Download CSV Template
        </button>
        <button
          onClick={downloadJSONTemplate}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <SCIcon icon={DownloadSimple} size="sm" />
          Download JSON Template
        </button>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "border-2 border-dashed rounded-md p-8 text-center transition-colors",
          file 
            ? "border-primary bg-primary/5" 
            : "border-border hover:border-muted-foreground"
        )}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <SCIcon icon={FileText} size="xl" className="text-primary" />
            <div className="text-left">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={handleClear}
              className="ml-4 p-1 hover:bg-muted rounded"
            >
              <SCIcon icon={XCircle} size="sm" />
            </button>
          </div>
        ) : (
          <>
            <SCIcon icon={UploadSimple} size="xl" className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-1">
              Drop your {format.toUpperCase()} file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <input
              type="file"
              accept={format === 'csv' ? '.csv' : '.json'}
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-sm font-medium"
            >
              Browse Files
            </label>
          </>
        )}
      </div>

      {/* Action Buttons */}
      {file && !result && (
        <button
          onClick={handleValidate}
          disabled={isValidating}
          className="w-full py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-medium"
        >
          {isValidating ? 'Validating...' : 'Validate'}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className={cn(
          "rounded-md border p-4",
          result.success && result.validCount > 0 
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
            : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
        )}>
          <div className="flex items-center gap-3 mb-4">
            {result.success && result.validCount > 0 ? (
              <SCIcon icon={CheckCircle} size="md" className="text-green-600" />
            ) : (
              <SCIcon icon={Warning} size="md" className="text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {result.success && result.validCount > 0 
                  ? `Valid: ${result.validCount} questions`
                  : 'Validation Failed'
                }
              </p>
              {result.errors.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {result.errors.length} error(s) found
                </p>
              )}
            </div>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="max-h-48 overflow-auto rounded border border-border bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Row</th>
                    <th className="px-3 py-2 text-left font-medium">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {result.errors.slice(0, 10).map((error, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-3 py-2">{error.row}</td>
                      <td className="px-3 py-2 text-red-600">{error.message}</td>
                    </tr>
                  ))}
                  {result.errors.length > 10 && (
                    <tr className="border-t border-border">
                      <td colSpan={2} className="px-3 py-2 text-center text-muted-foreground">
                        ...and {result.errors.length - 10} more errors
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Import Button (only if valid) */}
          {result.success && result.validCount > 0 && !result.imported && (
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="mt-4 w-full py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {isImporting ? 'Importing...' : `Import ${result.validCount} Questions`}
            </button>
          )}

          {/* Import Result */}
          {result.imported !== undefined && (
            <div className={cn(
              "mt-4 p-3 rounded",
              result.imported 
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
            )}>
              {result.imported 
                ? `Successfully imported ${result.validCount} questions!`
                : `Import failed: ${result.importError}`
              }
            </div>
          )}
        </div>
      )}
    </div>
  )
}
