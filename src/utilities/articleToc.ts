import { decodeHtmlEntities } from './htmlText'

export type ArticleHeading = {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Below this, a contents list is not worth its space: a single entry is a link
 * to the top of the article the reader is already looking at.
 *
 * It lives here rather than in the ArticleToc component because the page needs
 * it too, and that component is a client one — a plain value exported across
 * the 'use client' boundary reaches a server component as a client reference
 * rather than the number itself.
 */
export const MIN_TOC_HEADINGS = 2

export type ArticleToc = {
  /** The article HTML, with an `id` on every heading the contents list links to. */
  html: string
  headings: ArticleHeading[]
}

/** "How to open an account?" -> "how-to-open-an-account". */
const slugify = (value: string): string =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/**
 * Builds the "Contents" list from a post's HTML and gives every heading in it
 * an id to anchor to.
 *
 * The editor stores plain HTML with no ids, so until we add them there is
 * nothing for a contents link to point at. It happens here on the server
 * rather than in the browser so the ids are in the markup the page ships
 * with: someone following a shared /insights/post#section link lands on the
 * right section immediately, and so does a crawler reading the anchors.
 *
 * Only h2 and h3 are listed. The post title is the h1, and anything below h3
 * is detail that would make the list longer than the article is worth.
 */
export function buildArticleToc(content: string | null | undefined): ArticleToc {
  if (!content) return { html: '', headings: [] }

  const headings: ArticleHeading[] = []
  const used = new Set<string>()

  const html = content.replace(
    /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1\s*>/gi,
    (match, levelText: string, attrs: string, inner: string) => {
      const text = decodeHtmlEntities(inner.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim()

      // An empty heading — a stray one the editor left behind — gets no entry
      // and no id, so the list never shows a blank row to nowhere.
      if (!text) return match

      // Honour an id the editor already wrote, so a hand-made anchor someone
      // has already linked to keeps working.
      const existing = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1]

      let id = existing || slugify(text) || `section-${headings.length + 1}`

      // Two sections can legitimately share a title ("Summary" under each of
      // two parts). Without this they would share an id and every link to the
      // second would jump to the first.
      if (used.has(id)) {
        let suffix = 2
        while (used.has(`${id}-${suffix}`)) suffix += 1
        id = `${id}-${suffix}`
      }
      used.add(id)

      headings.push({ id, text, level: Number(levelText) === 3 ? 3 : 2 })

      if (existing) return match

      return `<h${levelText}${attrs} id="${id}">${inner}</h${levelText}>`
    },
  )

  return { html, headings }
}
