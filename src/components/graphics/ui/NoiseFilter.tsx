/**
 * Hidden SVG element that defines reusable grain/noise filters.
 * Place once in the root layout. Reference via filter="url(#grain)" or filter="url(#grain-light)".
 */
export function NoiseFilter() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle grain texture — 40% intensity for compositions */}
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves={3}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="saturate"
            values="0"
            in="noise"
            result="grayNoise"
          />
          <feBlend
            in="SourceGraphic"
            in2="grayNoise"
            mode="multiply"
            result="grain"
          />
          <feComponentTransfer in="grain">
            <feFuncA type="linear" slope="0.4" />
          </feComponentTransfer>
        </filter>

        {/* Even subtler grain — 15% for backgrounds */}
        <filter id="grain-light">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves={2}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="saturate"
            values="0"
            in="noise"
            result="grayNoise"
          />
          <feBlend
            in="SourceGraphic"
            in2="grayNoise"
            mode="multiply"
            result="grain"
          />
          <feComponentTransfer in="grain">
            <feFuncA type="linear" slope="0.15" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}
