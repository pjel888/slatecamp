const PARTNERS = [
  { name: 'Architecture schools', className: 'tracking-[0.18em] text-[13px] font-bold uppercase' },
  { name: 'Design studios', className: 'text-[16px] font-semibold' },
  { name: 'Material suppliers', className: 'tracking-[0.12em] text-[13px] font-bold uppercase' },
  { name: 'Planning offices', className: 'text-[15px] font-semibold' },
  { name: 'Construction teams', className: 'tracking-normal text-[14px] font-medium' },
  { name: 'Professional mentors', className: 'text-[15px] font-bold' },
  { name: 'Academic cohorts', className: 'font-serif tracking-[0.08em] text-[13px] font-semibold' },
  { name: 'Practice groups', className: 'text-[15px] font-black uppercase' },
] as const

export const LogoMarquee = ({ dark = false }: { dark?: boolean } = {}) => {
  const half = [...PARTNERS, ...PARTNERS, ...PARTNERS]
  const logos = [...half, ...half]
  return (
    <section
      aria-label="Architecture learning contexts"
      className={
        'marquee-container overflow-hidden border-y py-2 ' +
        (dark ? 'border-white/10' : 'border-border-design')
      }
    >
      <div className="marquee-track flex items-center">
        {logos.map((partner, i) => (
          <span
            key={`${partner.name}-${i}`}
            className={`shrink-0 px-10 opacity-25 transition-opacity duration-150 hover:opacity-80 select-none ${partner.className} ${
              dark ? 'text-white' : 'text-ink'
            }`}
          >
            {partner.name}
          </span>
        ))}
      </div>
    </section>
  )
}
