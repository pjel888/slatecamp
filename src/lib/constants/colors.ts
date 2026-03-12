/**
 * Centralized brand color palette — Apple HIG × Dieter Rams.
 * Single source of truth for SlateCamp UI. Use these constants directly in
 * components via inline styles (e.g. style={{ color: SLATECAMP_INK.main }}).
 */

/** Convert hex to rgba for opacity variants in inline styles. */
export const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** PAPER — Off-whites & light neutrals (Backgrounds, cards, hardware bodies) */
export const SLATECAMP_PAPER = {
  /** Apple HIG Core */
  DEFAULT: '#F5F4F0',
  warm: '#FAF6EE',
  cool: '#F5F5F7',
  snow: '#FFFFFF',

  /** Dieter Rams Core Neutrals */
  coolWhite: '#E1E4E1',
  pearl: '#DBD7D3',
  bone: '#D9D2C6',
  peachBone: '#D9C3B0',
  putty: '#BEBAB0',
  lightBeige: '#D9CAB8',
  mintyGrey: '#D3D8D2',
  warmGreyLight: '#BFB1A8',
  taupeBone: '#B9ADA4',
  greige: '#BCB3A6',
} as const

/** INK — Charcoals, deep browns & blacks (Text, shadows, dark hardware elements) */
export const SLATECAMP_INK = {
  /** Apple HIG Core */
  main: '#1D1D1F',
  muted: '#6E6E73',
  subtle: '#86868B',
  faint: '#AEAEB2',
  pure: '#000000',

  /** Dieter Rams Dark Accents */
  espresso: '#261201',
  void: '#090000',
  oliveBlack: '#3A3124',
  charcoalBrown: '#372E2D',
  slateBlack: '#292A2E',
  mauveCharcoal: '#50474C',
  darkCocoa: '#5B4A3B',
  darkOliveBrown: '#40341F',
  mediumDarkBrown: '#5F503E',
} as const

/** AMBER — Primary functional accents (CTAs, focus states, primary indicators) */
export const SLATECAMP_AMBER = {
  /** Core */
  DEFAULT: '#ED8008',
  hover: '#D4751A',
  muted: 'rgba(237, 128, 8, 0.12)',

  /** Dieter Rams Warm Accents */
  redOrange: '#ED3F1C',
  burntOrange: '#CC6324',
  rust: '#A43F14',
  terracotta: '#BD7033',
  burntRedOrange: '#C5441F',
  brightOrange: '#F07032',
  mustardBrown: '#BF7C2A',
  coral: '#E15E3E',
  gold: '#F1B73A',
} as const

/** CRIMSON — Critical actions & alerts (Errors, critical blindspots) */
export const SLATECAMP_CRIMSON = {
  deepRed: '#AD1D1D',
  classic: '#BF1B1B',
  brick: '#AF2E1B',
  crimson: '#AE2F25',
  brightRed: '#E6423A',
} as const

/** SAGE — Success & Mastery (Readiness score, completed nodes, correct answers) */
export const SLATECAMP_SAGE = {
  /** Core */
  DEFAULT: '#34C759',
  muted: 'rgba(52, 199, 89, 0.12)',

  /** Dieter Rams Greens */
  forest: '#0D703F',
  olive: '#736B1E',
  lightKhaki: '#B7B183',
} as const

/** COBALT — Information & secondary accents */
export const SLATECAMP_COBALT = {
  coolSteel: '#AAB7BF',
  darkBlueGrey: '#3B4B59',
  steelBlue: '#315B7B',
} as const

/** EARTH — Mid-tone warmth (Secondary backgrounds, muted UI dividers) */
export const SLATECAMP_EARTH = {
  taupe: '#736356',
  oliveKhaki1: '#84754A',
  oliveKhaki2: '#84764B',
  greyBrown: '#8B8178',
  tan: '#C09C6F',
  camel: '#BFA07A',
  sand: '#D8A367',
} as const

/** STONE — Pure functional greys (Disabled states, inactive hardware buttons) */
export const SLATECAMP_STONE = {
  greenishGrey: '#96937D',
  midGrey1: '#9C9C9C',
  midGrey2: '#9A9A9A',
} as const

/** BORDER — UI structural outlines */
export const SLATECAMP_BORDER = {
  DEFAULT: '#E5E5EA',
  strong: '#D2D2D7',
  light: 'rgba(29, 29, 31, 0.08)',
} as const

/** * EDUCATIONAL BLUE — Cognitive focus, calmness, and reduced exam anxiety.
 * Used for deep-focus areas, study camp environments, and reducing eye strain.
 */
export const SLATECAMP_EDUCATIONALBLUE = {
  // --- Core Educational Shades ---
  /** Ideal for general focus and calmness */
  sky: '#87CEEB',
  /** Standard for reducing anxiety in learning/testing environments */
  light: '#ADD8E6',
  /** Soft, gentle environments (use for low-stress onboarding) */
  powder: '#B0E0E6',

  // --- Specialized Learning Shades ---
  /** Boosts creativity and "outside the box" thinking */
  cornflower: '#6495ED',
  /** Vibrant, energetic blue for active learning and interactive 3D lab areas */
  royal: '#4169E1',
  /** Promotes deep concentration and authority (ideal for Storm Mode / Exam UI) */
  navy: '#000080',

  // --- Muted / Digital Options ---
  /** Sophisticated, muted tone that reduces eye strain on digital reading interfaces */
  blueGray: '#6699CC',
  /** Pale, airy choice for modern, serene digital workspaces */
  misty: '#B5C7EB',
} as const

/** * Flattened map for Tailwind / theme consumption.
 * This ensures the AI never uses raw hex codes and strictly uses semantic classes.
 */
export const SLATECAMP_COLORS = {
  // Paper
  'slatecamp-paper': SLATECAMP_PAPER.DEFAULT,
  'slatecamp-paper-warm': SLATECAMP_PAPER.warm,
  'slatecamp-paper-cool': SLATECAMP_PAPER.cool,
  'slatecamp-paper-snow': SLATECAMP_PAPER.snow,
  'slatecamp-paper-cool-white': SLATECAMP_PAPER.coolWhite,
  'slatecamp-paper-pearl': SLATECAMP_PAPER.pearl,
  'slatecamp-paper-bone': SLATECAMP_PAPER.bone,
  'slatecamp-paper-peach-bone': SLATECAMP_PAPER.peachBone,
  'slatecamp-paper-putty': SLATECAMP_PAPER.putty,
  'slatecamp-paper-light-beige': SLATECAMP_PAPER.lightBeige,
  'slatecamp-paper-minty-grey': SLATECAMP_PAPER.mintyGrey,
  'slatecamp-paper-warm-grey-light': SLATECAMP_PAPER.warmGreyLight,
  'slatecamp-paper-taupe-bone': SLATECAMP_PAPER.taupeBone,
  'slatecamp-paper-greige': SLATECAMP_PAPER.greige,

  // Ink
  'slatecamp-ink-main': SLATECAMP_INK.main,
  'slatecamp-ink-muted': SLATECAMP_INK.muted,
  'slatecamp-ink-subtle': SLATECAMP_INK.subtle,
  'slatecamp-ink-faint': SLATECAMP_INK.faint,
  'slatecamp-ink-pure': SLATECAMP_INK.pure,
  'slatecamp-ink-espresso': SLATECAMP_INK.espresso,
  'slatecamp-ink-void': SLATECAMP_INK.void,
  'slatecamp-ink-olive-black': SLATECAMP_INK.oliveBlack,
  'slatecamp-ink-charcoal-brown': SLATECAMP_INK.charcoalBrown,
  'slatecamp-ink-slate-black': SLATECAMP_INK.slateBlack,
  'slatecamp-ink-mauve-charcoal': SLATECAMP_INK.mauveCharcoal,
  'slatecamp-ink-dark-cocoa': SLATECAMP_INK.darkCocoa,
  'slatecamp-ink-dark-olive-brown': SLATECAMP_INK.darkOliveBrown,
  'slatecamp-ink-medium-dark-brown': SLATECAMP_INK.mediumDarkBrown,

  // Amber
  'slatecamp-amber': SLATECAMP_AMBER.DEFAULT,
  'slatecamp-amber-hover': SLATECAMP_AMBER.hover,
  'slatecamp-amber-muted': SLATECAMP_AMBER.muted,
  'slatecamp-amber-red-orange': SLATECAMP_AMBER.redOrange,
  'slatecamp-amber-burnt-orange': SLATECAMP_AMBER.burntOrange,
  'slatecamp-amber-rust': SLATECAMP_AMBER.rust,
  'slatecamp-amber-terracotta': SLATECAMP_AMBER.terracotta,
  'slatecamp-amber-burnt-red-orange': SLATECAMP_AMBER.burntRedOrange,
  'slatecamp-amber-bright-orange': SLATECAMP_AMBER.brightOrange,
  'slatecamp-amber-mustard-brown': SLATECAMP_AMBER.mustardBrown,
  'slatecamp-amber-coral': SLATECAMP_AMBER.coral,
  'slatecamp-amber-gold': SLATECAMP_AMBER.gold,

  // Crimson
  'slatecamp-crimson-deep-red': SLATECAMP_CRIMSON.deepRed,
  'slatecamp-crimson-classic': SLATECAMP_CRIMSON.classic,
  'slatecamp-crimson-brick': SLATECAMP_CRIMSON.brick,
  'slatecamp-crimson-crimson': SLATECAMP_CRIMSON.crimson,
  'slatecamp-crimson-bright-red': SLATECAMP_CRIMSON.brightRed,

  // Sage
  'slatecamp-sage': SLATECAMP_SAGE.DEFAULT,
  'slatecamp-sage-muted': SLATECAMP_SAGE.muted,
  'slatecamp-sage-forest': SLATECAMP_SAGE.forest,
  'slatecamp-sage-olive': SLATECAMP_SAGE.olive,
  'slatecamp-sage-light-khaki': SLATECAMP_SAGE.lightKhaki,

  // Cobalt
  'slatecamp-cobalt-cool-steel': SLATECAMP_COBALT.coolSteel,
  'slatecamp-cobalt-dark-blue-grey': SLATECAMP_COBALT.darkBlueGrey,
  'slatecamp-cobalt-steel-blue': SLATECAMP_COBALT.steelBlue,

  // Earth
  'slatecamp-earth-taupe': SLATECAMP_EARTH.taupe,
  'slatecamp-earth-olive-khaki-1': SLATECAMP_EARTH.oliveKhaki1,
  'slatecamp-earth-olive-khaki-2': SLATECAMP_EARTH.oliveKhaki2,
  'slatecamp-earth-grey-brown': SLATECAMP_EARTH.greyBrown,
  'slatecamp-earth-tan': SLATECAMP_EARTH.tan,
  'slatecamp-earth-camel': SLATECAMP_EARTH.camel,
  'slatecamp-earth-sand': SLATECAMP_EARTH.sand,

  // Stone
  'slatecamp-stone-greenish-grey': SLATECAMP_STONE.greenishGrey,
  'slatecamp-stone-mid-grey-1': SLATECAMP_STONE.midGrey1,
  'slatecamp-stone-mid-grey-2': SLATECAMP_STONE.midGrey2,

  // Border
  'slatecamp-border': SLATECAMP_BORDER.DEFAULT,
  'slatecamp-border-strong': SLATECAMP_BORDER.strong,
  'slatecamp-border-light': SLATECAMP_BORDER.light,

  // Educational Blue
  'slatecamp-edu-sky': SLATECAMP_EDUCATIONALBLUE.sky,
  'slatecamp-edu-light': SLATECAMP_EDUCATIONALBLUE.light,
  'slatecamp-edu-powder': SLATECAMP_EDUCATIONALBLUE.powder,
  'slatecamp-edu-cornflower': SLATECAMP_EDUCATIONALBLUE.cornflower,
  'slatecamp-edu-royal': SLATECAMP_EDUCATIONALBLUE.royal,
  'slatecamp-edu-navy': SLATECAMP_EDUCATIONALBLUE.navy,
  'slatecamp-edu-blue-gray': SLATECAMP_EDUCATIONALBLUE.blueGray,
  'slatecamp-edu-misty': SLATECAMP_EDUCATIONALBLUE.misty,
} as const

export type SlateCampColorKey = keyof typeof SLATECAMP_COLORS
