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
}): Promise<Metadata> => {
  const { doc } = args

  const ogImage = getImageURL(doc?.meta?.image)

  const title = doc?.meta?.title ? doc?.meta?.title + ' | Fastora' : 'Fastora'

  return {
    description: doc?.meta?.description ?? undefined,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage
        ? [
            {
              url: ogImage,
            },
          ]
        : undefined,
      title,
      url: doc?.slug ? `/${doc.slug}` : '/',
    }),
    // `absolute` bypasses the root layout's `%s | Fastora` title template —
    // without it Next appends the template on top of the suffix we already
    // added above, producing "Page | Fastora | Fastora".
    title: { absolute: title },
  }
}
