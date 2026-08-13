import type { MetadataRoute } from "next";

import {
  getCaseStudies,
  getPages,
  getPosts,
  getServices,
  safely,
} from "@/lib/api";
import { getServerSideURL } from "@/utilities/getURL";

/**
 * Without this the sitemap is prerendered exactly once, at build time, and
 * then frozen until the next deploy. That is the wrong failure mode here:
 * every content fetch below is wrapped in `safely`, so a backend that is
 * briefly down during a build yields a sitemap containing only the six
 * hardcoded static routes — and the build still reports success. Search
 * engines would then be told the site has six pages, indefinitely.
 *
 * An hour-long revalidate means the same outage costs at most an hour of a
 * thin sitemap instead of persisting until someone happens to redeploy.
 */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const url = getServerSideURL();

  const [pages, posts, services, caseStudies] = await Promise.all([
    safely(() => getPages(), []),
    safely(() => getPosts(), []),
    safely(() => getServices(), []),
    safely(() => getCaseStudies(), []),
  ]);

  // Services and case studies are seeded and never legitimately all-empty, so
  // an empty sweep means the API failed rather than that the CMS is bare.
  // Say so loudly: the `safely` wrappers above have already swallowed the
  // individual errors, and a warning is the only remaining signal.
  if (!services.length && !caseStudies.length && !posts.length) {
    console.error(
      "[fastora] sitemap: every content fetch came back empty, so the API " +
        "was almost certainly unreachable. Emitting static routes only. " +
        "This will self-correct on the next revalidation.",
    );
  }

  // These six are hardcoded rather than read from the CMS so they survive the
  // outage described above, but each still has a CMS record carrying its
  // editable page-header copy. Take `lastModified` from that record where it
  // exists, so listing them here costs nothing compared with the CMS sweep.
  const lastModifiedFor = (slug: string) =>
    pages.find((page) => page.slug === slug)?.updatedAt ?? undefined;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${url}/`,
      lastModified: lastModifiedFor("home"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${url}/services`,
      lastModified: lastModifiedFor("services"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${url}/case-studies`,
      lastModified: lastModifiedFor("case-studies"),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${url}/insights`,
      lastModified: lastModifiedFor("insights"),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${url}/about`,
      lastModified: lastModifiedFor("about"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${url}/contact`,
      lastModified: lastModifiedFor("contact"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // "home" is the site root, already listed above as "/". The other five
  // static routes are also CMS records — they carry the editable page-header
  // copy for those routes — so without excluding them here each was emitted
  // twice, once hardcoded and once from the CMS sweep.
  const staticSlugs = new Set([
    "home",
    "services",
    "case-studies",
    "insights",
    "about",
    "contact",
  ]);

  const pageRoutes: MetadataRoute.Sitemap = pages
    .filter((page) => !staticSlugs.has(page.slug || "") && !page.meta?.noindex)
    .map((page) => ({
      url: `${url}/${page.slug}`,
      lastModified: page.updatedAt ?? undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const postRoutes: MetadataRoute.Sitemap = posts
    .filter((post) => !post.meta?.noindex)
    .map((post) => ({
      url: `${url}/insights/${post.slug}`,
      lastModified: post.updatedAt ?? undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const serviceRoutes: MetadataRoute.Sitemap = services
    .filter((service) => !service.meta?.noindex)
    .map((service) => ({
      url: `${url}/services/${service.slug}`,
      lastModified: service.updatedAt ?? undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  const caseStudyRoutes: MetadataRoute.Sitemap = caseStudies
    .filter((study) => !study.meta?.noindex)
    .map((study) => ({
      url: `${url}/case-studies/${study.slug}`,
      lastModified: study.updatedAt ?? undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...caseStudyRoutes,
    ...postRoutes,
    ...pageRoutes,
  ];
}
