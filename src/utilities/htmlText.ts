/**
 * The named entities a rich editor actually emits — mostly the typographic
 * ones its smart-punctuation produces.
 *
 * Worth having rather than handling `&amp;`/`&lt;` alone: an em dash left as
 * `&mdash;` is invisible in a heading that gets slugified, but a speech
 * synthesiser reads it out as "ampersand mdash semicolon".
 */
const NAMED_ENTITIES: Record<string, string> = {
  mdash: '—',
  ndash: '–',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  bull: '•',
  middot: '·',
  times: '×',
  divide: '÷',
  deg: '°',
  copy: '©',
  reg: '®',
  trade: '™',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  sect: '§',
  para: '¶',
  dagger: '†',
  permil: '‰',
  prime: '′',
  Prime: '″',
  frasl: '⁄',
  minus: '−',
  plusmn: '±',
  ne: '≠',
  le: '≤',
  ge: '≥',
  shy: '',
  ensp: ' ',
  emsp: ' ',
  thinsp: ' ',
  zwj: '',
  zwnj: '',
}

/** Decodes the entities the CMS rich editor writes into text. */
export const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;|&#x0*27;/gi, "'")
    .replace(/&([a-z]+);/gi, (match, name: string) =>
      // Case matters: `&prime;` and `&Prime;` are different characters, so an
      // unknown name is left exactly as it was rather than lowercased away.
      Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name)
        ? NAMED_ENTITIES[name]!
        : match,
    )
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    // Last, so an escaped entity in the source ("&amp;lt;") decodes to the
    // text "&lt;" rather than being decoded twice into a "<".
    .replace(/&amp;/g, '&')

/** Block-level tags that end a sentence when they close. */
const BLOCK_TAGS =
  'address|article|aside|blockquote|div|dd|dl|dt|figcaption|figure|footer|h[1-6]|header|hr|li|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul'

/**
 * Flattens article HTML to the words a screen reader — or a speech synthesiser
 * — would actually say.
 *
 * Block boundaries become full stops rather than spaces. Without that, a
 * heading runs straight into the paragraph beneath it ("Conclusion Pick the
 * option...") and the synthesiser reads it as one breathless sentence, which
 * is also what the sentence-splitting below keys off.
 *
 * `script`, `style` and `figcaption` go entirely: the first two are not prose,
 * and a caption read aloud in the middle of a paragraph is an interruption
 * rather than a help.
 */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) return ''

  return decodeHtmlEntities(
    html
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
      .replace(/<figcaption\b[^>]*>[\s\S]*?<\/figcaption\s*>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '. ')
      .replace(new RegExp(`</(?:${BLOCK_TAGS})\\s*>`, 'gi'), '. ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    // The substitutions above happily produce ". . ." and " ." around tags
    // that were already punctuated.
    .replace(/\s+([.,;:!?])/g, '$1')
    // A heading already ending in "?" or "!" would otherwise come out of the
    // block rule above as "account?." — two terminators in a row.
    .replace(/([.!?])\.+/g, '$1')
    .replace(/(?:\.\s*){2,}/g, '. ')
    .trim()
}

/**
 * Breaks text into pieces short enough for the browser to finish speaking.
 *
 * Chrome stops mid-sentence on an utterance that runs much past ~15 seconds,
 * a long-standing bug with no error and no event — the voice simply stops. The
 * fix every workaround lands on is to never hand it a long utterance: split on
 * sentence boundaries and queue the pieces, which also gives the player
 * somewhere honest to report progress from.
 *
 * A sentence longer than the limit on its own is split at word boundaries
 * instead, so a run-on paragraph cannot slip past the cap.
 */
export function chunkForSpeech(text: string, maxLength = 180): string[] {
  if (!text) return []

  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text]
  const chunks: string[] = []
  let current = ''

  const pushCurrent = () => {
    const trimmed = current.trim()
    if (trimmed) chunks.push(trimmed)
    current = ''
  }

  for (const sentence of sentences) {
    if (sentence.length > maxLength) {
      pushCurrent()

      let line = ''
      for (const word of sentence.split(/\s+/)) {
        if (line && `${line} ${word}`.length > maxLength) {
          chunks.push(line)
          line = word
        } else {
          line = line ? `${line} ${word}` : word
        }
      }
      if (line.trim()) chunks.push(line.trim())
      continue
    }

    if (current && (current + sentence).length > maxLength) pushCurrent()
    current += sentence
  }

  pushCurrent()

  return chunks
}
