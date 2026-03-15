/**
 * Formats Supabase/PostgREST errors for logging. Class instances (e.g. PostgrestError)
 * often serialize as "{}" with console.error or JSON.stringify; this extracts
 * message, code, details, hint and returns a single string so the real error is always visible.
 */
export function formatSupabaseError(error: unknown): string {
  if (error == null) return String(error);
  if (typeof error !== "object") return String(error);

  const o = error as Record<string, unknown>;
  const message = o.message ?? (error as Error).message;
  const code = o.code;
  const details = o.details;
  const hint = o.hint;

  const hasAny =
    message !== undefined ||
    code !== undefined ||
    details !== undefined ||
    hint !== undefined;

  if (hasAny) {
    const parts = [
      `message: ${String(message ?? "(no message)")}`,
      `code: ${String(code ?? "(no code)")}`,
    ];
    if (details != null) parts.push(`details: ${String(details)}`);
    if (hint != null) parts.push(`hint: ${String(hint)}`);
    return parts.join(", ");
  }

  const fallback =
    typeof (error as Error).toString === "function"
      ? (error as Error).toString()
      : String(error);
  return fallback || "Unknown error";
}
