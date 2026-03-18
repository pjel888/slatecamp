/**
 * Subject fallback color when subject.color is null. Hex so it can be used in
 * inline styles (e.g. tint: `${color}15`). Matches design token --text-tertiary.
 */
export const FALLBACK_SUBJECT_COLOR = "#8896A7";

export { ROUTES, PUBLIC_PATHS } from "./routes";
export { siteConfig } from "./site";
export {
  getReadinessLabel,
  getReadinessColor,
  READINESS_THRESHOLDS,
  READINESS_DELTA_POSITIVE,
  READINESS_DELTA_NEGATIVE,
} from "./readiness";
