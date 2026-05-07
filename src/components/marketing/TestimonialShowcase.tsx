const USE_CASES = [
  {
    quote:
      'After lecture, use the 3D Lab to turn a flat code rule into a shape you can inspect and remember.',
    name: 'Visual learners',
    title: '3D explanations for spatial topics',
    rating: 5,
  },
  {
    quote:
      'After a mock exam, use the Readiness Score to see which weak topics need repair before they become exam-day surprises.',
    name: 'Board reviewees',
    title: 'Companion beside review centers and notes',
    rating: 5,
  },
  {
    quote:
      'During self-study, use quizzes, resources, and free tools to choose what to review next instead of rereading everything at random.',
    name: 'Architecture students',
    title: 'School, boards, and practice support',
    rating: 5,
  },
]

const StarRating = ({ count }: { count: number }) => (
  <div
    className='flex gap-0.5'
    aria-label={`${count} out of 5 value markers`}
    role='img'
  >
    {Array.from({ length: count }, (_, i) => (
      <svg
        key={i}
        className='h-3.5 w-3.5 text-warning'
        viewBox='0 0 20 20'
        fill='currentColor'
        aria-hidden='true'
      >
        <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
      </svg>
    ))}
  </div>
)

export const TestimonialShowcase = ({
  dark = false,
}: { dark?: boolean } = {}) => (
  <div className='mt-12 grid grid-cols-1 gap-3 sm:grid-cols-3'>
    {USE_CASES.map((item) => (
      <article
        key={item.name}
        className={
          'flex flex-col justify-between rounded-md border p-7 transition-transform duration-150 hover:-translate-y-0.5 ' +
          (dark
            ? 'border-white/10 bg-primary/40 text-white'
            : 'border-border-design bg-white')
        }
      >
        <div>
          <StarRating count={item.rating} />
          <blockquote
            className={`font-[family-name:var(--font-syne)] mt-5 text-[17px] italic leading-relaxed ${
              dark ? 'text-white/90' : 'text-ink'
            }`}
          >
            &ldquo;{item.quote}&rdquo;
          </blockquote>
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
            {item.name}
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
