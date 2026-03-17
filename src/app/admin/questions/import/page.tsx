import { QuestionImporter } from '@/components/admin/QuestionImporter'

export default function ImportQuestionsPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Import Questions</h1>
        <p className="text-muted-foreground">Bulk import questions from CSV or JSON files</p>
      </div>

      <QuestionImporter />
    </div>
  )
}
