const H1_CLASS =
  'font-[family-name:var(--font-display)] text-[clamp(3rem,8vw,5.8rem)] font-extrabold leading-[0.9] tracking-[-0.038em] text-foreground'

export const HeroHeadline = () => (
  <>
    <h1 className={H1_CLASS}>Navigate architecture knowledge with confidence.</h1>
    <div className='pt-2'>
      <p className='mt-6 max-w-lg text-sm font-medium leading-relaxed text-primary'>
        Source-backed resources, visual explanations, quizzes, 3D labs, and practical tools
        for school, boards, and practice.
      </p>
    </div>
  </>
)
