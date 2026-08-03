import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { getPosts, safely } from '@/lib/api'
import { Media } from '@/components/Media'
import { PageHeader } from '@/components/PageHeader'
import { formatDateTime } from '@/utilities/formatDateTime'
import { generateMeta } from '@/utilities/generateMeta'
import { queryUtilityPage } from '@/utilities/queryUtilityPage'

const FALLBACK = {
  eyebrow: 'Insights',
  heading: 'Thinking on communication and brand strategy',
  description:
    'Practical ideas on communications, branding, and digital strategy, for businesses that want to be understood, not just seen.',
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryUtilityPage('insights')
  return generateMeta({
    doc: page || { meta: { title: 'Insights', description: FALLBACK.description, image: null } },
  })
}

export default async function InsightsPage() {
  const [page, posts] = await Promise.all([
    queryUtilityPage('insights'),
    safely(() => getPosts({ limit: 100 }), []),
  ])

  return (
    <div>
      <PageHeader
        eyebrow={page?.pageHeaderEyebrow || FALLBACK.eyebrow}
        title={page?.pageHeaderHeading || FALLBACK.heading}
        description={page?.pageHeaderDescription || FALLBACK.description}
      />

      <section className="container pb-24 pt-16">
        {posts.length ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-reveal-group="110">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/insights/${post.slug}`}
                data-reveal="up"
                className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {post.heroImage && typeof post.heroImage === 'object' && (
                    <Media
                      resource={post.heroImage}
                      fill
                      imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {Array.isArray(post.categories) &&
                      post.categories.map((c) =>
                        typeof c === 'object' && c ? <span key={c.id}>{c.title}</span> : null,
                      )}
                    {post.publishedAt && <span>· {formatDateTime(post.publishedAt)}</span>}
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">{post.title}</h2>
                  {post.meta?.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{post.meta.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No insights published yet.</p>
        )}
      </section>
    </div>
  )
}
