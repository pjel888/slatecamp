import Link from 'next/link'
import {
  ArrowRight,
  Binoculars,
  BookOpenText,
  ChartLineUp,
  Compass,
  Flag,
  Fire,
  GraduationCap,
  MapTrifold,
  Mountains,
  Notebook,
  Path,
  Sparkle,
  UsersThree,
  Waves,
} from '@phosphor-icons/react/dist/ssr'
import { HeroCampScene } from './HeroCampScene'

type Icon = typeof Compass

interface CampLandingPageProps {
  ctaHref: string
  ctaLabel: string
  isLoggedIn: boolean
}

const JOURNEY_STOPS = [
  {
    id: 'trail',
    icon: Path,
    title: 'Trails',
    label: 'Guided learning paths',
    body: 'Follow a structured route through LEA topics, prerequisites, and practice instead of piecing together a plan from scattered notes.',
  },
  {
    id: 'campfire',
    icon: Fire,
    title: 'Campfire',
    label: 'Notes, discussion, reflection',
    body: 'Gather ideas from practice, wiki references, and community momentum so each study block leaves a clear trace.',
  },
  {
    id: 'lake',
    icon: Waves,
    title: 'Lake',
    label: 'Review with clarity',
    body: 'Readiness signals and heatmaps turn noisy progress into a calm view of what needs one more pass.',
  },
  {
    id: 'summit',
    icon: Mountains,
    title: 'Mountains',
    label: 'Mastery milestones',
    body: 'Climb toward measurable confidence with subject coverage, calibrated practice, and exam-day readiness.',
  },
  {
    id: 'shore',
    icon: Flag,
    title: 'Shore',
    label: 'Launch your next goal',
    body: 'Turn review into action: simulations, focused drills, and a clear next destination after every session.',
  },
] as const

const FEATURES = [
  {
    icon: MapTrifold,
    title: 'Guided Trails',
    eyebrow: 'Curriculum paths',
    body: 'Structured study routes help candidates move through the LEA syllabus with less guesswork and fewer dead ends.',
  },
  {
    icon: ChartLineUp,
    title: 'Readiness Tracking',
    eyebrow: 'Progress intelligence',
    body: 'A live Readiness Score and taxonomy heatmap show where you stand before exam day.',
  },
  {
    icon: Notebook,
    title: 'Campfire Notes',
    eyebrow: 'Knowledge capture',
    body: 'Keep references, reflections, and review notes close to the questions and topics that created them.',
  },
  {
    icon: UsersThree,
    title: 'Cohort Momentum',
    eyebrow: 'Shared accountability',
    body: 'Built to support self-paced learners, review groups, and professional routines without turning study into noise.',
  },
  {
    icon: GraduationCap,
    title: 'Professional Workflow',
    eyebrow: 'Student to practitioner',
    body: 'Architecture-focused tools, wiki references, and 3D models connect exam prep to real practice.',
  },
] as const

const STEPS = [
  {
    title: 'Choose your trail',
    body: 'Start from a guided path, diagnostic, or focused topic depending on where you are in review.',
  },
  {
    title: 'Learn with focused resources',
    body: 'Move between practice, wiki references, notes, and 3D explanations without losing context.',
  },
  {
    title: 'Practice and reflect',
    body: 'Use drills, review prompts, and clear explanations to turn mistakes into the next study move.',
  },
  {
    title: 'Reach your summit',
    body: 'Track readiness, close gaps, and build a routine that lasts through exam season.',
  },
] as const

const USE_CASES = [
  {
    title: 'Students',
    body: 'Build a repeatable review routine around the LEA syllabus, practice, and progress signals.',
  },
  {
    title: 'Working professionals',
    body: 'Use focused sessions and clear next steps when study time has to fit around real work.',
  },
  {
    title: 'Teams or cohorts',
    body: 'Create shared momentum around paths, discussion, and measurable readiness.',
  },
  {
    title: 'Self-paced learners',
    body: 'Explore at your own pace while still knowing what to do next.',
  },
] as const

const FAQS = [
  {
    q: 'Is SlateCamp only for the Philippine Architecture Licensure Exam?',
    a: 'The current product is built specifically for LEA preparation, with architecture-focused practice, wiki references, and 3D learning tools.',
  },
  {
    q: 'Does the camp metaphor replace serious analytics?',
    a: 'No. The metaphor organizes the landing experience; the product still centers readiness scoring, syllabus mapping, and practical study workflows.',
  },
  {
    q: 'Can I start without a paid plan?',
    a: 'SlateCamp is free to start. Public self-serve payment options depend on the current checkout flow.',
  },
] as const

export function CampLandingPage({
  ctaHref,
  ctaLabel,
  isLoggedIn,
}: CampLandingPageProps) {
  return (
    <>
      <HeroSection ctaHref={ctaHref} ctaLabel={ctaLabel} isLoggedIn={isLoggedIn} />
      <TrustBand />
      <JourneySection />
      <FeatureSection />
      <HowItWorksSection />
      <UseCasesSection />
      <SocialProofSection />
      <FaqSection />
      <FinalCampCta ctaHref={ctaHref} ctaLabel={isLoggedIn ? ctaLabel : 'Join SlateCamp'} />
    </>
  )
}

function HeroSection({ ctaHref, ctaLabel, isLoggedIn }: CampLandingPageProps) {
  return (
    <section
      className='relative overflow-hidden px-6 pb-12 pt-20 md:pb-16 md:pt-24'
      style={{ backgroundColor: '#f8f6f0' }}
    >
      <div className='mx-auto grid max-w-[1200px] items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]'>
        <div className='relative z-10 py-8 md:py-12'>
          <div className='inline-flex items-center gap-2 rounded-sm border border-border-design bg-white px-3 py-2 text-[12px] font-bold text-text-2 shadow-sm'>
            <Compass size={15} weight='bold' className='text-camp-cobalt' />
            Professional LEA review platform
          </div>
          <h1 className='mt-6 max-w-3xl font-display text-[clamp(2.8rem,8vw,5.75rem)] font-black leading-[0.95] text-ink'>
            Your Learning Basecamp
          </h1>
          <p className='mt-6 max-w-[620px] text-[17px] leading-8 text-text-2'>
            SlateCamp helps students and professionals turn scattered learning into guided
            progress — with structured paths, notes, practice, community, and a live view of
            Philippine Architecture Licensure Exam readiness.
          </p>
          <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
            <Link
              href={ctaHref}
              className='inline-flex items-center justify-center gap-2 rounded-sm bg-camp-cobalt px-6 py-3 text-[14px] font-bold text-white transition-colors duration-150 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt focus-visible:ring-offset-2'
            >
              {isLoggedIn ? ctaLabel : 'Start Your Trail'}
              <ArrowRight size={16} weight='bold' />
            </Link>
            <a
              href='#how-it-works'
              className='inline-flex items-center justify-center rounded-sm border border-border-design bg-white px-6 py-3 text-[14px] font-bold text-ink transition-colors duration-150 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt focus-visible:ring-offset-2'
            >
              See How It Works
            </a>
          </div>
          <div className='mt-8 grid max-w-[620px] gap-3 sm:grid-cols-3'>
            {[
              'Syllabus-mapped LEA prep',
              'Readiness Score powered by IRT',
              'Built by a licensed architect',
            ].map((item) => (
              <div
                key={item}
                className='rounded-md border border-border-design bg-white/80 px-4 py-3 text-[12px] font-bold leading-snug text-text-2'
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <HeroCampScene />
      </div>
    </section>
  )
}

function TrustBand() {
  return (
    <section className='border-y border-border-design bg-white px-6 py-4' aria-label='Product credibility'>
      <div className='mx-auto grid max-w-[1200px] gap-3 text-center sm:grid-cols-3'>
        <TrustItem label='Built for LEA candidates' />
        <TrustItem label='Question paths mapped to architecture subjects' />
        <TrustItem label='3D models for spatial concepts' />
      </div>
    </section>
  )
}

function TrustItem({ label }: { label: string }) {
  return <p className='text-[13px] font-bold text-text-2'>{label}</p>
}

function JourneySection() {
  return (
    <section
      id='camp-map'
      className='px-6 py-20'
      style={{ backgroundColor: '#f8f6f0' }}
      aria-labelledby='camp-map-heading'
    >
      <div className='mx-auto max-w-[1200px]'>
        <SectionHeader
          icon={Binoculars}
          headingId='camp-map-heading'
          eyebrow='Explore the camp'
          title='A product map learners can understand at a glance.'
          body='The landscape is a narrative layer for real product behavior: paths, discussion, review, mastery, and outcomes.'
        />
        <div className='mt-10 grid gap-3 md:grid-cols-5'>
          {JOURNEY_STOPS.map((stop) => (
            <article
              key={stop.id}
              className='rounded-md border border-border-design bg-white p-5 transition-transform duration-150 hover:-translate-y-0.5'
            >
              <stop.icon size={22} weight='bold' className='text-camp-cobalt' />
              <p className='mt-5 text-[11px] font-bold uppercase text-muted-foreground'>
                {stop.title}
              </p>
              <h3 className='mt-1 text-[15px] font-bold text-ink'>{stop.label}</h3>
              <p className='mt-3 text-[13px] leading-relaxed text-text-2'>{stop.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureSection() {
  return (
    <section id='features' className='bg-white px-6 py-20' aria-labelledby='features-heading'>
      <div className='mx-auto max-w-[1200px]'>
        <SectionHeader
          icon={Sparkle}
          headingId='features-heading'
          eyebrow='Features'
          title='Practical tools, framed as a guided learning trail.'
          body='The camp story stays subtle. The value is concrete: structure, progress, notes, collaboration, and professional context.'
        />
        <div className='mt-10 grid gap-3 md:grid-cols-3'>
          {FEATURES.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} featured={index === 0} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon: IconComponent,
  eyebrow,
  title,
  body,
  featured,
}: {
  icon: Icon
  eyebrow: string
  title: string
  body: string
  featured?: boolean
}) {
  return (
    <article
      className={`rounded-md border p-5 ${
        featured
          ? 'border-camp-cobalt bg-primary-50 md:col-span-2'
          : 'border-border-design bg-card'
      }`}
    >
      <IconComponent size={24} weight='bold' className='text-camp-cobalt' />
      <p className='mt-5 text-[11px] font-bold uppercase text-muted-foreground'>{eyebrow}</p>
      <h3 className='mt-1 text-[17px] font-bold text-ink'>{title}</h3>
      <p className='mt-3 max-w-2xl text-[14px] leading-relaxed text-text-2'>{body}</p>
    </article>
  )
}

function HowItWorksSection() {
  return (
    <section
      id='how-it-works'
      className='px-6 py-20 text-white'
      style={{ backgroundColor: '#172235' }}
      aria-labelledby='how-it-works-heading'
    >
      <div className='mx-auto max-w-[1200px]'>
        <SectionHeader
          icon={Compass}
          headingId='how-it-works-heading'
          eyebrow='How it works'
          title='From trailhead to summit, every step has a next action.'
          body='Choose a route, study with context, practice deliberately, then use readiness signals to decide what comes next.'
          dark
        />
        <div className='mt-12 grid gap-6 md:grid-cols-4'>
          {STEPS.map((step, index) => (
            <article key={step.title} className='border-l border-white/20 pl-5'>
              <span className='font-mono text-[32px] font-bold text-white/25'>
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className='mt-4 text-[16px] font-bold text-white'>{step.title}</h3>
              <p className='mt-3 text-[13px] leading-relaxed text-white/65'>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCasesSection() {
  return (
    <section id='use-cases' className='bg-white px-6 py-20' aria-labelledby='use-cases-heading'>
      <div className='mx-auto max-w-[1200px]'>
        <SectionHeader
          icon={BookOpenText}
          headingId='use-cases-heading'
          eyebrow='Use cases'
          title='Built for serious learners with different schedules.'
          body='SlateCamp keeps the workflow clear whether you study alone, with a group, between work hours, or in a dedicated review season.'
        />
        <div className='mt-10 grid gap-3 md:grid-cols-4'>
          {USE_CASES.map((useCase) => (
            <article key={useCase.title} className='rounded-md border border-border-design bg-card p-5'>
              <h3 className='text-[16px] font-bold text-ink'>{useCase.title}</h3>
              <p className='mt-3 text-[13px] leading-relaxed text-text-2'>{useCase.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function SocialProofSection() {
  return (
    <section
      className='px-6 py-20'
      style={{ backgroundColor: '#f8f6f0' }}
      aria-labelledby='proof-heading'
    >
      <div className='mx-auto max-w-[1200px]'>
        <SectionHeader
          icon={UsersThree}
          headingId='proof-heading'
          eyebrow='Trust'
          title='Credibility space for outcomes, partners, and candidate stories.'
          body='This section is intentionally placeholder-ready until verified testimonials, institutional logos, or outcome data are ready to publish.'
        />
        <div className='mt-10 grid gap-3 md:grid-cols-3'>
          {[
            'Replace with a verified candidate quote after launch interviews.',
            'Add review-center, school, or partner marks only after permission.',
            'Publish real outcome data only when the cohort sample is large enough.',
          ].map((item) => (
            <article key={item} className='rounded-md border border-dashed border-border-design bg-white p-5'>
              <p className='text-[11px] font-bold uppercase text-muted-foreground'>
                Placeholder-ready
              </p>
              <p className='mt-3 text-[14px] leading-relaxed text-text-2'>{item}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqSection() {
  return (
    <section id='faq' className='bg-white px-6 py-20' aria-labelledby='faq-heading'>
      <div className='mx-auto max-w-[900px]'>
        <SectionHeader
          icon={Compass}
          headingId='faq-heading'
          eyebrow='FAQ'
          title='Plain answers before you start.'
          body='The landing page is more immersive, but the product promise remains direct.'
        />
        <div className='mt-8 divide-y divide-border-design rounded-md border border-border-design bg-card'>
          {FAQS.map((faq) => (
            <details key={faq.q} className='group p-5'>
              <summary className='cursor-pointer list-none text-[15px] font-bold text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camp-cobalt'>
                {faq.q}
              </summary>
              <p className='mt-3 text-[14px] leading-relaxed text-text-2'>{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCampCta({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string
  ctaLabel: string
}) {
  return (
    <section
      className='px-6 pb-20'
      style={{ backgroundColor: '#f8f6f0' }}
      aria-label='Start learning'
    >
      <div
        className='mx-auto max-w-[1200px] overflow-hidden rounded-lg p-8 text-white md:p-12'
        style={{ backgroundColor: '#172235' }}
      >
        <div className='grid gap-8 md:grid-cols-[1fr_auto] md:items-center'>
          <div>
            <p className='text-[11px] font-bold uppercase text-white/55'>Trailhead</p>
            <h2 className='mt-3 max-w-2xl font-display text-[clamp(2rem,4vw,3.75rem)] font-black leading-tight text-white'>
              Ready to start your next learning trail?
            </h2>
            <p className='mt-4 max-w-xl text-[15px] leading-relaxed text-white/65'>
              Begin at basecamp, follow a path, and keep your progress visible all the way to exam readiness.
            </p>
          </div>
          <Link
            href={ctaHref}
            className='inline-flex items-center justify-center gap-2 rounded-sm px-6 py-3 text-[14px] font-bold text-white transition-opacity duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-camp-black'
            style={{ backgroundColor: '#E8853A' }}
          >
            {ctaLabel}
            <ArrowRight size={16} weight='bold' />
          </Link>
        </div>
      </div>
    </section>
  )
}

function SectionHeader({
  icon: IconComponent,
  headingId,
  eyebrow,
  title,
  body,
  dark = false,
}: {
  icon: Icon
  headingId: string
  eyebrow: string
  title: string
  body: string
  dark?: boolean
}) {
  return (
    <div className='max-w-3xl'>
      <div
        className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase ${
          dark ? 'text-white/55' : 'text-muted-foreground'
        }`}
      >
        <IconComponent size={16} weight='bold' className={dark ? 'text-camp-orange' : 'text-camp-cobalt'} />
        {eyebrow}
      </div>
      <h2
        id={headingId}
        className={`mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-black leading-tight ${
          dark ? 'text-white' : 'text-ink'
        }`}
      >
        {title}
      </h2>
      <p className={`mt-4 text-[15px] leading-7 ${dark ? 'text-white/65' : 'text-text-2'}`}>
        {body}
      </p>
    </div>
  )
}
