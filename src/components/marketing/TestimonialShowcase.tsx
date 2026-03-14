import { Instrument_Serif } from 'next/font/google'

const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const TESTIMONIALS = [
  {
    quote:
      'Cerebro\u2019s 3D Library completely changed how I understand Building Tech. It\u2019s like having a site visit in my pocket.',
    name: 'Maria S.',
    title: '4th Year Architecture Student',
    rating: 5,
  },
  {
    quote:
      'The Readiness Score predicted my ALE passing rate with terrifying accuracy. I walked into the exam room with zero panic.',
    name: 'Juan D.',
    title: 'Newly Licensed Architect',
    rating: 5,
  },
  {
    quote:
      'I abandoned my physical flashcards entirely. The Spaced Repetition engine on this platform is unmatched.',
    name: 'Carlos R.',
    title: 'ALE Topnotcher',
    rating: 5,
  },
]

const StarRating = ({ count }: { count: number }) => (
  <div
    className='flex gap-0.5'
    aria-label={`${count} out of 5 stars`}
    role='img'
  >
    {Array.from({ length: count }, (_, i) => (
      <svg
        key={i}
        className='h-3.5 w-3.5 text-amber-500'
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
    {TESTIMONIALS.map((testimonial) => (
      <article
        key={testimonial.name}
        className={
          'flex flex-col justify-between rounded-2xl border p-7 transition-transform duration-150 hover:-translate-y-0.5 ' +
          (dark
            ? 'border-white/10 bg-blue-500/40 text-white'
            : 'border-zinc-200 bg-white shadow-sm')
        }
      >
        <div>
          <StarRating count={testimonial.rating} />
          <blockquote
            className={`${serif.className} mt-5 text-[17px] italic leading-relaxed`}
            style={{ color: dark ? 'rgba(255,255,255,0.9)' : undefined }}
            className={`${serif.className} mt-5 text-[17px] italic leading-relaxed ${
              dark ? 'text-white/90' : 'text-zinc-900'
            }`}
          >
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
        </div>
        <div
          className={
            'mt-6 border-t pt-5 ' +
            (dark ? 'border-white/10' : 'border-zinc-200')
          }
        >
          <p
            className={
              'text-[14px] font-semibold ' +
              (dark ? 'text-white' : 'text-zinc-900')
            }
          >
            {testimonial.name}
          </p>
          <p
            className={
              'mt-0.5 text-[12px] ' + (dark ? 'text-white/60' : 'text-zinc-500')
            }
          >
            {testimonial.title}
          </p>
        </div>
      </article>
    ))}
  </div>
)
