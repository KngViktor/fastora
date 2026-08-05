import { getServerSideURL } from './getURL'

type Crumb = {
  name: string
  /** Omit on the final crumb — Schema.org takes the current page URL instead. */
  path?: string
}

/**
 * Builds BreadcrumbList structured data for an inner page.
 *
 * Google uses this to show a navigation path in the search result instead of a
 * bare URL, which matters most on a three-level site like this one: without it,
 * `/services/communications-strategy` shows as a raw path.
 *
 * Two rules the spec is strict about, and both are easy to get wrong by hand,
 * which is why this is one helper rather than repeated per page:
 *
 *  - At least two items, or the page is not eligible at all.
 *  - The last item carries no `item` URL. Including a self-link on the final
 *    crumb is the most common reason a breadcrumb validates but never appears.
 *
 * The path should mirror how a person navigates, not the URL structure — they
 * usually match here, but the trail is the thing being described.
 */
export function buildBreadcrumbs(crumbs: Crumb[]) {
  const base = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.path ? { item: `${base}${crumb.path}` } : {}),
    })),
  }
}
