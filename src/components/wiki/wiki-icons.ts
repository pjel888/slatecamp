/**
 * Maps wiki root-category slugs to Lucide icon names.
 * Used by WikiSidebar and WikiHomePage to render subject-specific icons.
 */
import {
  Landmark,
  Lightbulb,
  Briefcase,
  Scale,
  Hammer,
  Plug,
  Triangle,
  PencilRuler,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'

export const WIKI_SUBJECT_ICONS: Record<string, LucideIcon> = {
  'history-of-architecture': Landmark,
  'theory-of-architecture': Lightbulb,
  'professional-practice': Briefcase,
  'building-laws': Scale,
  'building-materials-construction': Hammer,
  'building-utilities': Plug,
  'structural-conceptualization': Triangle,
  'architectural-design-site-planning': PencilRuler,
}

/** Fallback for any category without a mapped icon */
export const DEFAULT_WIKI_ICON: LucideIcon = BookOpen
