/**
 * Maps wiki root-category slugs to Phosphor icon components.
 * Used by WikiSidebar and WikiHomePage to render subject-specific icons.
 */
import {
  Bank,
  Lightbulb,
  Briefcase,
  Scales,
  Hammer,
  Plug,
  Triangle,
  PencilRuler,
  BookOpen,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'

export const WIKI_SUBJECT_ICONS: Record<string, PhosphorIcon> = {
  'history-of-architecture': Bank,
  'theory-of-architecture': Lightbulb,
  'professional-practice': Briefcase,
  'building-laws': Scales,
  'building-materials-construction': Hammer,
  'building-utilities': Plug,
  'structural-conceptualization': Triangle,
  'architectural-design-site-planning': PencilRuler,
}

/** Fallback for any category without a mapped icon */
export const DEFAULT_WIKI_ICON: PhosphorIcon = BookOpen
