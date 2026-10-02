/**
 * Whether rich text from Filament's RichEditor has anything a reader would see.
 *
 * Clearing the editor doesn't save null: it saves an empty paragraph like
 * `<p></p>` or `<p><br></p>`, which is truthy, so a plain `if (body)` printed
 * the section's heading over nothing.
 */
export function hasRichTextContent(html: string | null | undefined): boolean {
  if (!html) return false
  if (/<(img|video|iframe|figure|hr)\b/i.test(html)) return true

  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .trim()

  return text.length > 0
}
