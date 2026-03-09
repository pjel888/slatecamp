import { FileText } from 'lucide-react'
import { NewNoteButton } from '@/components/notes/NewNoteButton'

export default function NotesIndexPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-16 text-center">
      <div className="rounded-2xl border border-border/60 bg-card p-12 shadow-sm max-w-md">
        <FileText className="mx-auto h-14 w-14 text-muted-foreground/60" strokeWidth={1} />
        <h2 className="mt-4 text-lg font-semibold text-foreground">No note selected</h2>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Select a note from the list or create a new one to start writing.
        </p>
        <NewNoteButton className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-signal-blue) px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90" />
      </div>
    </div>
  )
}
