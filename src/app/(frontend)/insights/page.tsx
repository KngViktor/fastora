import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { getPosts, safely } from '@/lib/api'
import { Media } from '@/components/Media'
import { NewsletterForm } from '@/components/NewsletterForm'
import { PageHeader } from '@/components/PageHeader'
import { formatDateTime } from '@/utilities/formatDateTime'
import { generateUtilityPageMeta } from '@/utilities/generateMeta'
import { queryUtilityPage } from '@/utilities/queryUtilityPage'
import { InsightsGrid } from './InsightsGrid'

const FALLBACK = {
  eyebrow: 'Insights',
  heading: 'Insights',
  description:
    'Articles, observations, and practical insights on communication, branding, and digital strategy, shaped by our work and the businesses we serve.',
}

export async function generateMetadata(): Promise<Metadata> {
  return generateUtilityPageMeta({
    page: await queryUtilityPage('insights'),
    fallback: { title: 'Insights', description: FALLBACK.description },
    path: '/insights',
  })
}

export default async function InsightsPage() {
  const [page, posts] = await Promise.all([
    queryUtilityPage('insights'),
    safely(() => getPosts({ limit: 100 }), []),
  ])

  // At most one pinned post is featured up top; the rest of the grid never
  // shows it a second time. If more than one is toggled on in the admin, the
  // most recently published wins, since `posts` already comes back newest first.
  const featuredPost = posts.find((post) => post.featured) ?? null
  const gridPosts = featuredPost ? posts.filter((post) => post.id !== featuredPost.id) : posts

  return (
    <div>
      <PageHeader
        eyebrow={page?.pageHeaderEyebrow || FALLBACK.eyebrow}
        title={page?.pageHeaderHeading || FALLBACK.heading}
        description={page?.pageHeaderDescription || FALLBACK.description}
      />

      {featuredPost && (
        <section className="container pt-16">
          <Link
            href={`/insights/${featuredPost.slug}`}
            data-reveal="up"
            className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-border bg-card transition-colors hover:border-secondary/60 lg:grid-cols-2"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-muted lg:aspect-auto">
              {featuredPost.heroImage && typeof featuredPost.heroImage === 'object' && (
                <Media
                  resource={featuredPost.heroImage}
                  fill
                  imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <div className="flex flex-col justify-center p-8 md:p-12">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {featuredPost.categories.map((c) => (
                  <span key={c.id} className="text-secondary">
                    {c.title}
                  </span>
                ))}
                <span>· {featuredPost.readingTimeMinutes} min read</span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold md:text-3xl">{featuredPost.title}</h2>
              {featuredPost.meta?.description && (
                <p className="mt-3 max-w-lg text-muted-foreground">
                  {featuredPost.meta.description}
                </p>
              )}
              <div className="mt-6 flex items-center gap-4">
                {featuredPost.publishedAt && (
                  <time dateTime={featuredPost.publishedAt} className="text-xs text-muted-foreground">
                    {formatDateTime(featuredPost.publishedAt)}
                  </time>
                )}
                <span className="inline-flex items-center gap-1 text-sm font-medium text-secondary">
                  Read article →
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      <section className="container pb-24 pt-16">
        <h2 className="text-2xl font-semibold md:text-3xl" data-reveal="up">
          From the Fastora Journal
        </h2>
        <div className="mt-10">
          <InsightsGrid posts={gridPosts} />
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="container grid grid-cols-1 gap-10 py-12 md:grid-cols-2 md:py-16">
          <h2 className="text-2xl font-semibold md:text-3xl" data-reveal="up">
            Why we write
          </h2>
          <div data-reveal="up" className="text-muted-foreground [&_p+p]:mt-4">
            <p>Good ideas deserve to be shared.</p>
            <p>
              The Fastora Journal is where we explore the questions we&apos;re asking, the
              patterns we&apos;re noticing, and the lessons we learn while working with businesses.
            </p>
            <p>Some articles come from client work.</p>
            <p>Others begin as conversations, observations, or ideas that deserve a closer look.</p>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div
          data-reveal="up"
          className="rounded-3xl border border-border bg-card p-8 text-center md:p-14"
        >
          <h2 className="text-2xl font-semibold md:text-3xl">
            Stay connected with the Fastora Journal.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Receive new insights, practical insights, and occasional updates from our team.
          </p>
          <NewsletterForm variant="light" source="insights" className="mt-6" />
        </div>
      </section>
    </div>
  )
}
