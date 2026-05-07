const H1_CLASS =
  'font-[family-name:var(--font-geist-sans)] text-[clamp(3rem,8vw,5.8rem)] font-black leading-[0.9] tracking-[-0.055em] text-foreground'

export const HeroHeadline = () => (
  <>
    <h1 className={H1_CLASS}>Your architecture study companion.</h1>
    <div className='pt-2'>
      <p className='mt-6 max-w-lg text-sm font-medium leading-relaxed text-primary'>
        Source-backed resources, quizzes, 3D labs, and free tools for architecture school,
        Licensure Examination for Architects readiness, and professional practice.
      </p>
    </div>
  </>
)
