import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { getPageBySlug, getPageSlugs, safely } from '@/lib/api'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'

// Slugs owned by dedicated route files (app/(frontend)/<slug>/page.tsx),
// which need real logic — live collection queries, a form — that the
// block-based layout can't express. Their Pages documents exist only to
// make the header copy CMS-editable; this catch-all must never render them.
const RESERVED_SLUGS = ['home', 'services', 'case-studies', 'contact', 'insights', 'login']

export async function generateStaticParams() {
  const slugs = await safely(() => getPageSlugs(), [])

  return slugs.filter((slug) => Boolean(slug) && !RESERVED_SLUGS.includes(slug)).map((slug) => ({ slug }))
}

type Args = {
  params: Promise<{ slug?: string }>
}

export default async function Page({ params }: Args) {
  const { slug = 'home' } = await params

  // Reserved slugs are served by their own dedicated route files.
  if (RESERVED_SLUGS.includes(slug)) notFound()

  const page = await queryPageBySlug({ slug })

  if (!page) notFound()

  const { hero, layout } = page

  return (
    <article>
      <RenderHero
        type={hero.type}
        eyebrow={hero.eyebrow}
        richText={hero.richText}
        links={hero.links}
        media={hero.media}
      />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = 'home' } = await params
  const page = await queryPageBySlug({ slug })
  return generateMeta({ doc: page, path: `/${slug}` })
}

/**
 * Deliberately not wrapped in safely().
 *
 * safely() returns null when the request fails, and null here means notFound().
 * That made an unreachable API indistinguishable from a page that does not
 * exist, so a momentary blip on the API host turned into a 404 — which Next
 * then cached for the revalidate window. Live pages disappeared this way:
 * /about, /terms-of-use and /cookie-policy all 404ed and recovered on their own
 * minutes later.
 *
 * apiFetchOrNull already draws the distinction, returning null only when the
 * API genuinely answers 404 and throwing for anything else. Letting it throw
 * keeps "missing" and "unreachable" apart: the first 404s as it should, the
 * second surfaces as an error and is retried on the next request instead of
 * being cached as a permanent absence.
 */
const queryPageBySlug = cache(async ({ slug }: { slug: string }) => getPageBySlug(slug))
