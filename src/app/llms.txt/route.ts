import {
  DEFAULT_SITE_SETTINGS,
  getCaseStudies,
  getPosts,
  getServices,
  getSiteSettings,
  safely,
} from '@/lib/api'
import { getServerSideURL } from '@/utilities/getURL'

/**
 * llms.txt — a plain-text map of the site for AI assistants and answer
 * engines, in the emerging convention (llmstxt.org).
 *
 * Search crawlers get sitemap.xml and JSON-LD; those are machine formats
 * built for ranking. An assistant answering "who should I hire for brand
 * strategy in Lagos" is instead reading pages and summarising them, so this
 * gives it the same information already in the CMS as short labelled prose,
 * with links, rather than making it infer the structure from markup.
 *
 * Content comes from the API, so it stays correct as the CMS changes.
 */
export const revalidate = 3600

function section(title: string, lines: string[]): string {
  return lines.length ? `## ${title}\n\n${lines.join('\n')}\n` : ''
}

export async function GET(): Promise<Response> {
  const url = getServerSideURL()

  const [settings, services, caseStudies, posts] = await Promise.all([
    safely(() => getSiteSettings(), DEFAULT_SITE_SETTINGS),
    safely(() => getServices({ limit: 100 }), []),
    safely(() => getCaseStudies({ limit: 100 }), []),
    safely(() => getPosts({ limit: 50 }), []),
  ])

  // Same reasoning as sitemap.ts: every fetch above degrades to empty rather
  // than throwing, so an outage during a build produces a file with a heading
  // and nothing else. Unlike the sitemap this route already revalidates, so
  // it recovers on its own — but the warning is what makes it diagnosable.
  if (!services.length && !caseStudies.length && !posts.length) {
    console.error(
      '[fastora] llms.txt: every content fetch came back empty, so the API ' +
        'was almost certainly unreachable. Serving a near-empty file until ' +
        'the next revalidation.',
    )
  }

  const name = settings.siteName || 'Fastora'

  const body = [
    `# ${name}`,
    '',
    settings.tagline ?? 'Communications and digital strategy.',
    '',
    section('Services', services.map((s) => `- [${s.title}](${url}/services/${s.slug}): ${s.summary}`)),
    section(
      'Case studies',
      caseStudies.map(
        (c) =>
          `- [${c.title}](${url}/case-studies/${c.slug}): ${c.summary}` +
          (c.clientName ? ` Client: ${c.clientName}.` : '') +
          (c.industry ? ` Industry: ${c.industry}.` : ''),
      ),
    ),
    section(
      'Insights',
      posts.map((p) => `- [${p.title}](${url}/insights/${p.slug})${p.meta?.description ? `: ${p.meta.description}` : ''}`),
    ),
    section(
      'Contact',
      [
        settings.contactEmail ? `- Email: ${settings.contactEmail}` : '',
        settings.contactPhone ? `- Phone: ${settings.contactPhone}` : '',
        settings.address ? `- Location: ${settings.address}` : '',
        `- Enquiry form: ${url}/contact`,
      ].filter(Boolean),
    ),
  ]
    .filter(Boolean)
    .join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
