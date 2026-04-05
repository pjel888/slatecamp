/**
 * Parse a prop that may come as:
 * 1. A native JS array/object (when passed programmatically)
 * 2. A string with JS object literal syntax (from MDX expression-to-string conversion)
 *    e.g. '[{ value: "40%", label: "Total Weight" }]'
 *
 * MDX (next-mdx-remote) only supports string props, so complex props are
 * pre-processed by convertExpressionPropsToStrings() in WikiArticle.tsx
 * which converts {[...]} to "&quot;-escaped strings.
 *
 * This function handles the reverse: decoding &quot; entities, quoting
 * bare JS object keys, and parsing as JSON.
 */
export const parseMdxProp = <T>(value: T | string | undefined, fallback: T): T => {
  if (value === undefined || value === null) return fallback
  if (typeof value !== 'string') return value

  try {
    // Decode HTML entities from MDX attribute encoding
    let str = (value as string).replace(/&quot;/g, '"').replace(/&amp;/g, '&')

    // Convert bare JS object keys to quoted JSON keys
    // Matches: { key: or , key: — adds quotes around the key
    str = str.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')

    return JSON.parse(str) as T
  } catch {
    return fallback
  }
}
