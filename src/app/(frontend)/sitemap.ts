import type { MetadataRoute } from 'next'

import { getCaseStudies, getPages, getPosts, getServices, safely } from '@/lib/api'
import { getServerSideURL } from '@/utilities/getURL'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = getServerSideURL()

  const [pages, posts, services, caseStudies] = await Promise.all([
    safely(() => getPages(), []),
    safely(() => getPosts(), []),
    safely(() => getServices(), []),
    safely(() => getCaseStudies(), []),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${url}/services`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${url}/case-studies`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${url}/insights`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${url}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${url}/contact`, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter((page) => !['home'].includes(page.slug || ''))
    .map((page) => ({
      url: `${url}/${page.slug}`,
      lastModified: page.updatedAt ?? undefined,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${url}/insights/${post.slug}`,
    lastModified: post.updatedAt ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const serviceRoutes: MetadataRoute.Sitemap = services.map((service) => ({
    url: `${url}/services/${service.slug}`,
    lastModified: service.updatedAt ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies.map((study) => ({
    url: `${url}/case-studies/${study.slug}`,
    lastModified: study.updatedAt ?? undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...serviceRoutes, ...caseStudyRoutes, ...postRoutes, ...pageRoutes]
}
