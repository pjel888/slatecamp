const PARTNERS = [
  // --- Original Suppliers & Firms ---
  { name: 'BOYSEN', className: 'tracking-[0.25em] text-[13px] font-bold' },
  { name: 'Holcim', className: 'tracking-tight text-[18px] font-semibold' },
  { name: 'NELTEX', className: 'tracking-[0.15em] text-[14px] font-bold' },
  { name: 'AIDEA', className: 'tracking-[0.2em] text-[15px] font-semibold' },
  {
    name: 'WTA Design Studio',
    className: 'tracking-normal text-[14px] font-medium',
  },

  // --- Added Architectural Suppliers ---
  {
    name: 'WILCON DEPOT',
    className: 'tracking-tighter text-[16px] font-black',
  }, // Heavy, thick block letters
  {
    name: 'DAVIES',
    className: 'tracking-tight text-[17px] font-extrabold',
  }, // Bold, imposing sans-serif
  {
    name: 'HardieFlex',
    className: 'tracking-tighter text-[16px] font-bold italic',
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
    className: 'tracking-tighter text-[15px] font-black uppercase',
  }, // Athletic, bold block lettering for NU
  {
    name: 'MAPÚA UNIVERSITY',
    className: 'tracking-tight text-[15px] font-bold uppercase',
  }, // Strong, technical, engineering-focused weight
  {
    name: 'UP Diliman',
    className: 'font-serif tracking-normal text-[15px] font-bold',
  }, // Academic serif, classic weight
]

export function LogoMarquee({ dark = false }: { dark?: boolean } = {}) {
  /*
   * Each "half" of the track needs to be wider than the widest viewport
   * (~1920px) so there's never a visible gap. Repeating 3x per half
   * gives ~3600px of content. The -50% animation shifts exactly one half.
   */
  const half = [...PARTNERS, ...PARTNERS, ...PARTNERS]
  const logos = [...half, ...half]

  return (
    <section
      aria-label='Trusted by leading architecture brands'
      className={`marquee-container overflow-hidden border-y py-2 ${
        dark ? 'border-white/[0.06]' : 'border-[#1D1D1F]/[0.06]'
      }`}
    >
      <div className='marquee-track flex items-center'>
        {logos.map((partner, i) => (
          <span
            key={`${partner.name}-${i}`}
            className={`shrink-0 px-10 opacity-25 transition-opacity duration-150 hover:opacity-80 select-none ${
              dark ? 'text-white' : 'text-[#1D1D1F]'
            } ${partner.className}`}
          >
            {partner.name}
          </span>
        ))}
      </div>
    </section>
  )
}
