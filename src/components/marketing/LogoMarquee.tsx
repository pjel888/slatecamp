const PARTNERS = [
  { name: "BOYSEN", className: "tracking-[0.25em] text-[13px] font-bold" },
  { name: "Holcim", className: "tracking-tight text-[18px] font-semibold" },
  { name: "NELTEX", className: "tracking-[0.15em] text-[14px] font-bold" },
  { name: "AIDEA", className: "tracking-[0.2em] text-[15px] font-semibold" },
  {
    name: "WTA Design Studio",
    className: "tracking-normal text-[14px] font-medium",
  },
];

export function LogoMarquee() {
  /*
   * Each "half" of the track needs to be wider than the widest viewport
   * (~1920px) so there's never a visible gap. Repeating 3x per half
   * gives ~3600px of content. The -50% animation shifts exactly one half.
   */
  const half = [...PARTNERS, ...PARTNERS, ...PARTNERS];
  const logos = [...half, ...half];

  return (
    <section
      aria-label="Trusted by leading architecture brands"
      className="marquee-container overflow-hidden border-y border-[#1D1D1F]/[0.06] py-6"
    >
      <div className="marquee-track flex items-center">
        {logos.map((partner, i) => (
          <span
            key={`${partner.name}-${i}`}
            className={`shrink-0 px-10 text-[#1D1D1F] opacity-25 transition-opacity duration-150 hover:opacity-80 select-none ${partner.className}`}
          >
            {partner.name}
          </span>
        ))}
      </div>
    </section>
  );
}
