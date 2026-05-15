import Link from 'next/link'
import { notFound } from 'next/navigation'
import { readFileSync } from 'fs'
import { join } from 'path'
import { DoorHinge3D } from '@/components/wiki/blocks/DoorHinge3D'
import { WikiArticle } from '@/components/wiki/article/WikiArticle'
import type { WikiArticle as WikiArticleType } from '@/types/app'

export const dynamic = 'force-dynamic'

type HingeType = 'butt' | 'loose-pin' | 'ball-bearing' | 'spring' | 'pivot' | 'continuous' | 'concealed' | 'parliament' | 'strap'
type PreviewMode = 'model' | 'article'

type HingePreview = {
  type: HingeType
  label: string
  note: string
}

const HINGE_PREVIEWS: HingePreview[] = [
  { type: 'butt', label: 'Butt', note: 'Baseline full-mortise leaf, knuckle, pin, screw pattern.' },
  { type: 'loose-pin', label: 'Loose-pin', note: 'Should read as a butt hinge with a visibly removable pin/head.' },
  { type: 'ball-bearing', label: 'Ball-bearing', note: 'Needs bearing collars/washers that are recognizable, not just colored rings.' },
  { type: 'spring', label: 'Spring', note: 'Needs a believable spring barrel/self-closing clue without toy-like clutter.' },
  { type: 'pivot', label: 'Pivot', note: 'Should read as top/bottom pivot hardware, not a generic door slab.' },
  { type: 'continuous', label: 'Continuous', note: 'Should read as a long piano hinge with repeating knuckles along the length.' },
  { type: 'concealed', label: 'Concealed', note: 'Should read closer to a cabinet/concealed cup hinge with articulated arms.' },
  { type: 'parliament', label: 'Parliament', note: 'Needs a wide-throw offset silhouette, not simply two plates spread apart.' },
  { type: 'strap', label: 'Strap', note: 'Should read as face-fixed strap/T hinge hardware, not an abstract arrow.' },
]

function getLocalArticle(): WikiArticleType {
  const content = readFileSync(
    join(process.cwd(), '.ai/03_plans/articles/door-hinges-and-architectural-hardware-upgraded.md'),
    'utf8',
  )

  return {
    article_id: 'local-door-hinges-preview',
    slug: 'door-hinges-and-architectural-hardware-local-preview',
    title: 'Door Hinges and Architectural Hardware — local preview',
    content,
    created_at: new Date(0).toISOString(),
    updated_at: new Date().toISOString(),
    subject_label: 'LEA-MATL · Building Materials and Construction',
    difficulty_label: 'Intermediate',
    read_time: '~22 min',
    updated_note: 'Local-only development preview. Do not use this route as production content.',
  }
}

function getMode(value: string | string[] | undefined): PreviewMode {
  return value === 'article' ? 'article' : 'model'
}

function getHingeType(value: string | string[] | undefined): HingeType {
  const type = Array.isArray(value) ? value[0] : value
  return HINGE_PREVIEWS.some((item) => item.type === type) ? (type as HingeType) : 'butt'
}

function PreviewNav({ mode, selectedType }: { mode: PreviewMode; selectedType: HingeType }) {
  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href={`/dev/door-hinges-preview?mode=model&type=${selectedType}`}
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
          mode === 'model'
            ? 'border-camp-cobalt-600 bg-camp-cobalt-600 text-white'
            : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
        }`}
      >
        Model workbench
      </Link>
      <Link
        href="/dev/door-hinges-preview?mode=article"
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] ${
          mode === 'article'
            ? 'border-camp-cobalt-600 bg-camp-cobalt-600 text-white'
            : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
        }`}
      >
        Article preview
      </Link>
    </nav>
  )
}

export default async function DoorHingesPreviewPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  if (process.env.NODE_ENV === 'production') notFound()

  const params = (await searchParams) ?? {}
  const mode = getMode(params.mode)
  const selectedType = getHingeType(params.type)
  const selected = HINGE_PREVIEWS.find((item) => item.type === selectedType) ?? HINGE_PREVIEWS[0]

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-50 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
            Local dev route · not published · not linked
          </p>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Door hinge article + 3D model QA bench</h1>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700 dark:text-slate-300">
                Local-first iteration route for fixing the hardware visuals before any Supabase update. The route intentionally renders either one 3D canvas or the full article, not both, to avoid WebGL context overload during QA.
              </p>
            </div>
            <PreviewNav mode={mode} selectedType={selectedType} />
          </div>
        </header>

        {mode === 'model' ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-camp-cobalt-600 dark:text-camp-cobalt-300">
                    Model selector
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">One canvas at a time</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Acceptance target: the hardware type should be recognizable before reading the card title.
                  </p>
                </div>
                <div className="grid gap-2">
                  {HINGE_PREVIEWS.map((item) => (
                    <Link
                      key={item.type}
                      href={`/dev/door-hinges-preview?mode=model&type=${item.type}`}
                      className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${
                        selectedType === item.type
                          ? 'border-camp-cobalt-500 bg-camp-cobalt-50 text-camp-cobalt-900 dark:border-camp-cobalt-400 dark:bg-camp-cobalt-950/40 dark:text-camp-cobalt-100'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-semibold">{item.label}</span>
                      <span className="mt-1 block text-xs leading-5 opacity-80">{item.note}</span>
                    </Link>
                  ))}
                </div>
              </aside>
              <div className="min-w-0 rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <DoorHinge3D type={selected.type} caption={selected.note} />
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 border-b border-slate-200 pb-4 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-camp-cobalt-600 dark:text-camp-cobalt-300">
                Local article renderer
              </p>
              <h2 className="mt-1 text-2xl font-semibold">Article preview from local MDX draft</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                This renders the local MDX through the production wiki renderer. Use only after the single-model workbench is stable.
              </p>
            </div>
            <WikiArticle article={getLocalArticle()} nodeId="5443f82e-20aa-4f63-bf27-7f0a8571cacb" nodeName="Hardware, Joints & Fasteners" />
          </section>
        )}
      </div>
    </main>
  )
}
