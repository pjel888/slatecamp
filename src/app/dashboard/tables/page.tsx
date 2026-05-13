import { Table } from '@phosphor-icons/react/dist/ssr'

export default function TablesPage() {
  return (
    <div className='flex flex-col items-center justify-center h-full px-4 py-12 text-center'>
      <div className='mx-auto w-20 h-20 bg-primary-50 rounded-md flex items-center justify-center border border-primary/20 shadow-sm'>
        <Table size={48} className='text-primary' />
      </div>
      <div className='space-y-3 mt-8'>
        <h2 className='font-display text-xl font-bold text-text-primary'>Tables</h2>
        <p className='text-muted-foreground text-sm leading-relaxed max-w-lg mx-auto'>
          Quick-reference tables for codes, standards, and exam data coming soon.
        </p>
      </div>
    </div>
  )
}
