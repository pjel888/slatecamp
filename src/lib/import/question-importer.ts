import Papa from 'papaparse'
import { 
  QuestionCSVSchema, 
  QuestionJSONSchema, 
  validateCSVQuestion, 
  validateJSONQuestion,
  csvToDbFormat,
  jsonToDbFormat,
  type QuestionCSV,
  type QuestionJSON
} from './question-schema'

export interface ImportError {
  row: number
  message: string
}

export interface ImportResult {
  success: boolean
  validCount: number
  errors: ImportError[]
}

// Parse CSV file
export async function parseCSV(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        const errors: ImportError[] = []
        let validCount = 0

        results.data.forEach((row: unknown, index: number) => {
          try {
            // Convert dynamicTyping results to proper types
            const typedRow = row as Record<string, unknown>
            const processedRow = {
              ...typedRow,
              taxonomy_node_id: String(typedRow.taxonomy_node_id || ''),
              question_text: String(typedRow.question_text || ''),
              option_a: String(typedRow.option_a || ''),
              option_b: String(typedRow.option_b || ''),
              option_c: String(typedRow.option_c || ''),
              option_d: String(typedRow.option_d || ''),
              option_e: typedRow.option_e ? String(typedRow.option_e) : undefined,
              correct_answer: String(typedRow.correct_answer || '').toLowerCase() as 'a' | 'b' | 'c' | 'd' | 'e',
              rationale: typedRow.rationale ? String(typedRow.rationale) : undefined,
              difficulty: Number(typedRow.difficulty) || 1,
            }
            
            validateCSVQuestion(processedRow)
            validCount++
          } catch (error) {
            if (error instanceof Error) {
              errors.push({
                row: index + 2, // +2 for header row and 0-index
                message: error.message,
              })
            } else {
              errors.push({
                row: index + 2,
                message: 'Unknown validation error',
              })
            }
          }
        })

        // Strict validation: reject entire batch on any error
        resolve({
          success: errors.length === 0,
          validCount,
          errors,
        })
      },
      error: (error) => {
        resolve({
          success: false,
          validCount: 0,
          errors: [{ row: 0, message: error.message }],
        })
      },
    })
  })
}

// Parse JSON file
export async function parseJSON(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        
        // Check for bulk import format
        if (data.questions && Array.isArray(data.questions)) {
          const errors: ImportError[] = []
          let validCount = 0
          
          data.questions.forEach((item: unknown, index: number) => {
            try {
              validateJSONQuestion(item)
              validCount++
            } catch (error) {
              if (error instanceof Error) {
                errors.push({
                  row: index + 1,
                  message: error.message,
                })
              } else {
                errors.push({
                  row: index + 1,
                  message: 'Unknown validation error',
                })
              }
            }
          })
          
          resolve({
            success: errors.length === 0,
            validCount,
            errors,
          })
        } else {
          // Single question format
          try {
            validateJSONQuestion(data)
            resolve({
              success: true,
              validCount: 1,
              errors: [],
            })
          } catch (error) {
            resolve({
              success: false,
              validCount: 0,
              errors: [{
                row: 1,
                message: error instanceof Error ? error.message : 'Invalid JSON format',
              }],
            })
          }
        }
      } catch (error) {
        resolve({
          success: false,
          validCount: 0,
          errors: [{
            row: 0,
            message: error instanceof Error ? error.message : 'Failed to parse JSON',
          }],
        })
      }
    }
    
    reader.onerror = () => {
      resolve({
        success: false,
        validCount: 0,
        errors: [{ row: 0, message: 'Failed to read file' }],
      })
    }
    
    reader.readAsText(file)
  })
}

// Get questions from CSV file content
export function getQuestionsFromCSV(file: File): Promise<QuestionCSV[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const questions: QuestionCSV[] = []
        
        results.data.forEach((row: unknown) => {
          const typedRow = row as Record<string, unknown>
          try {
            const processedRow = {
              taxonomy_node_id: String(typedRow.taxonomy_node_id || ''),
              question_text: String(typedRow.question_text || ''),
              option_a: String(typedRow.option_a || ''),
              option_b: String(typedRow.option_b || ''),
              option_c: String(typedRow.option_c || ''),
              option_d: String(typedRow.option_d || ''),
              option_e: typedRow.option_e ? String(typedRow.option_e) : undefined,
              correct_answer: String(typedRow.correct_answer || '').toLowerCase() as 'a' | 'b' | 'c' | 'd' | 'e',
              rationale: typedRow.rationale ? String(typedRow.rationale) : undefined,
              difficulty: Number(typedRow.difficulty) || 1,
            }
            
            questions.push(QuestionCSVSchema.parse(processedRow))
          } catch {
            // Skip invalid rows - they'll be caught in validation
          }
        })
        
        resolve(questions)
      },
      error: (error) => reject(error),
    })
  })
}

// Get questions from JSON file content
export function getQuestionsFromJSON(file: File): Promise<QuestionJSON[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)
        
        if (data.questions && Array.isArray(data.questions)) {
          resolve(data.questions.map((q: unknown) => QuestionJSONSchema.parse(q)))
        } else {
          resolve([QuestionJSONSchema.parse(data)])
        }
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
