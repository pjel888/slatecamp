const PARTNERS = [
  // --- Original Suppliers & Firms ---
  { name: 'BOYSEN', className: 'tracking-[0.25em] text-[13px] font-bold' },
  { name: 'Holcim', className: 'text-[18px] font-semibold' },
  { name: 'NELTEX', className: 'tracking-[0.15em] text-[14px] font-bold' },
  { name: 'AIDEA', className: 'tracking-[0.2em] text-[15px] font-semibold' },
  {
    name: 'WTA Design Studio',
    className: 'tracking-normal text-[14px] font-medium',
  },

  // --- Added Architectural Suppliers ---
  {
    name: 'WILCON DEPOT',
    className: 'text-[16px] font-black',
  }, // Heavy, thick block letters
  {
    name: 'DAVIES',
    className: 'text-[17px] font-extrabold',
  }, // Bold, imposing sans-serif
  {
    name: 'HardieFlex',
    className: 'text-[16px] font-bold italic',
  }, // Slanted, tight corporate logo feel
  {
    name: 'PALAFOX',
    className: 'tracking-[0.3em] text-[14px] font-light uppercase',
  }, // Elegant, widely spaced, minimalist firm branding

  // --- Added Universities / Architecture Schools ---
  {
    name: 'UNIVERSITY OF SANTO TOMAS',
    className: 'font-serif tracking-[0.1em] text-[13px] font-semibold',
  }, // Classic, traditional serif for UST
  {
    name: 'NATIONAL UNIVERSITY',
    className: 'text-[15px] font-black uppercase',
  }, // Athletic, bold block lettering for NU
  {
    name: 'MAPÚA UNIVERSITY',
    className: 'text-[15px] font-bold uppercase',
  }, // Strong, technical, engineering-focused weight
  {
    name: 'UP Diliman',
    className: 'font-serif tracking-normal text-[15px] font-bold',
  }, // Academic serif, classic weight
]

export const LogoMarquee = ({ dark = false }: { dark?: boolean } = {}) => {
  const half = [...PARTNERS, ...PARTNERS, ...PARTNERS]
  const logos = [...half, ...half]
  return (
    <section
      aria-label="Architecture schools and industry brands"
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
