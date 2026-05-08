const USE_CASES = [
  {
    body: 'After lecture, use the 3D Lab to turn a flat code rule into a shape you can inspect and remember.',
    label: 'Visual learners',
    title: '3D explanations for spatial topics',
  },
  {
    body: 'After a mock exam, use readiness signals to see which weak topics need repair before they become exam-day surprises.',
    label: 'Architecture learners',
    title: 'Clearer map for notes, questions, and topics',
  },
  {
    body: 'During self-study, use quizzes, resources, and free tools to choose what to review next instead of rereading everything at random.',
    label: 'Architecture students',
    title: 'School, boards, and practice support',
  },
]

export const TestimonialShowcase = ({
  dark = false,
}: { dark?: boolean } = {}) => (
  <div className='mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3'>
    {USE_CASES.map((item) => (
      <article
        key={item.label}
        className={
          'flex flex-col justify-between rounded-md border p-7 transition-transform duration-150 hover:-translate-y-0.5 ' +
          (dark
            ? 'border-white/10 bg-primary/40 text-white'
            : 'border-border-design bg-white')
        }
      >
        <div>
          <p
            className={`font-[family-name:var(--font-dm-mono)] text-[10px] font-semibold uppercase tracking-[0.16em] ${
              dark ? 'text-white/60' : 'text-camp-cobalt'
            }`}
          >
            Use case
          </p>
          <p
            className={`font-[family-name:var(--font-syne)] mt-5 text-[17px] leading-relaxed ${
              dark ? 'text-white/90' : 'text-ink'
            }`}
          >
            {item.body}
          </p>
        </div>
        <div
          className={
            'mt-6 border-t pt-5 ' +
            (dark ? 'border-white/10' : 'border-border-design')
          }
        >
          <p
            className={
              'text-[14px] font-semibold ' +
              (dark ? 'text-white' : 'text-ink')
            }
          >
            {item.label}
          </p>
          <p
            className={
              'mt-0.5 text-[12px] ' + (dark ? 'text-white/60' : 'text-text-2')
            }
          >
            {item.title}
          </p>
        </div>
      </article>
    ))}
  </div>
)
