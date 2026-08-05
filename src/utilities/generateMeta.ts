import type { Metadata } from 'next'

import type { CaseStudy, Media, Page, Post, Service } from '@/lib/api'

import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | null) => {
  if (!image?.url) return undefined

  // Laravel media URLs are already absolute (derived from APP_URL); only
  // prepend this app's own server URL for locally-rooted paths.
  return image.url.startsWith('/') ? getServerSideURL() + image.url : image.url
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | Partial<Service> | Partial<CaseStudy> | null
  /**
   * This route's own path, e.g. "/services/brand-consulting". Used for the
   * self-referencing canonical and the Open Graph URL. Without it the page
   * still works, it just falls back to the site root for those two tags.
   */
  path?: string
}): Promise<Metadata> => {
  const { doc, path } = args

  const ogImage = getImageURL(doc?.meta?.image)
  const url = path ?? (doc?.slug ? `/${doc.slug}` : '/')

  // Append the brand only when it is not already in the editor's title. The home
  // page's SEO title is "Fastora, Communications & Digital Strategy", so an
  // unconditional suffix produced "… Digital Strategy | Fastora" — the brand
  // twice in one title, which reads as carelessness in a search result.
  //
  // Case-insensitive because an editor typing "FASTORA" means the same thing.
  const editorTitle = doc?.meta?.title?.trim()
  const title = editorTitle
    ? editorTitle.toLowerCase().includes('fastora')
      ? editorTitle
      : `${editorTitle} | Fastora`
    : 'Fastora'

  // An editor-supplied canonical wins; otherwise the page points at itself,
  // which is what Google recommends for pages that are their own original.
  const canonical = doc?.meta?.canonicalUrl || `${getServerSideURL()}${url}`

  return {
    description: doc?.meta?.description ?? undefined,
    alternates: { canonical },
    // Only emitted when an editor ticks "Hide from search engines", so the
    // default stays indexable rather than accidentally hiding the site.
    ...(doc?.meta?.noindex ? { robots: { index: false, follow: false } } : {}),
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage ? [{ url: ogImage }] : undefined,
      title,
      url,
    }),
    // `absolute` bypasses the root layout's `%s | Fastora` title template —
    // without it Next appends the template on top of the suffix we already
    // added above, producing "Page | Fastora | Fastora".
    title: { absolute: title },
  }
}
