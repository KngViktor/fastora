import type { Metadata } from 'next'
import React, { cache } from 'react'

import { getPageBySlug, safely } from '@/lib/api'
import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'

const queryHomePage = cache(async () => safely(() => getPageBySlug('home'), null))

export default async function HomePage() {
  const page = await queryHomePage()

  if (!page) {
    return (
      <div className="container-page py-24">
        <h1 className="text-4xl font-semibold">Fastora</h1>
        <p className="mt-4 text-muted-foreground">
          No Home page found. Create a page with slug &ldquo;home&rdquo; in /admin, or run the
          seed script.
        </p>
      </div>
    )
  }

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

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryHomePage()
  return generateMeta({ doc: page })
}
