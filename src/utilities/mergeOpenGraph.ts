import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

/**
 * Fallback Open Graph tags, used whenever a page supplies none of its own.
 *
 * These were still the starter template's values, so any Fastora link shared
 * without page-specific metadata previewed as "Payload Website Template" with
 * a broken image — /website-template-OG.webp was never in public/.
 */
const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Communications and digital strategy for businesses that want to be understood.',
  images: [
    {
      url: `${getServerSideURL()}/brand/og-image.png`,
    },
  ],
  siteName: 'Fastora',
  title: 'Fastora',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
