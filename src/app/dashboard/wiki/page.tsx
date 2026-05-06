import { BookOpen, MagnifyingGlass, Sparkle } from '@phosphor-icons/react/dist/ssr'

export default function WikiPage() {
  return (
    <div className='text-center space-y-8 px-4 py-6'>
      <div className='mx-auto w-20 h-20 bg-primary-50 rounded-md flex items-center justify-center border border-primary/20 shadow-sm'>
        <BookOpen size={48} className='text-primary' />
      </div>
      <div className='space-y-3'>
        <h2 className='font-display text-xl font-bold text-text-primary'>Start Learning</h2>
        <p className='text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto'>
          Browse taxonomy topics, read articles enriched with interactive components, and build your mastery across all 8 LEA root categories.
        </p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-left'>
        <div className='p-4 bg-card rounded-md border border-border shadow-sm space-y-2'>
          <div className='w-8 h-8 bg-warning-50 rounded-md flex items-center justify-center'>
            <MagnifyingGlass size={18} className='text-warning' />
          </div>
          <h3 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] text-text-2'>Syllabus Mapped</h3>
          <p className='text-xs text-muted-foreground leading-relaxed'>Every article is aligned strictly with the 8 LEA root categories.</p>
        </div>
        <div className='p-4 bg-card rounded-md border border-border shadow-sm space-y-2'>
          <div className='w-8 h-8 bg-primary-50 rounded-md flex items-center justify-center'>
            <Sparkle size={18} className='text-primary' />
          </div>
          <h3 className='font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] text-text-2'>Interactive Content</h3>
          <p className='text-xs text-muted-foreground leading-relaxed'>Complex codes come alive with 2D illustrations and 3D spatial lab models.</p>
        </div>
      </div>
      <div className='pt-8 border-t border-border'>
        <p className='text-sm text-muted-foreground'>Tip: Use the sidebar to expand categories and find specific articles.</p>
      </div>
    </div>
  )
}
