import Link from 'next/link'
import React from 'react'

import { getPosts } from '@/lib/api'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  limit?: number | null
}

export const LatestInsightsBlockComponent: React.FC<Props> = async ({ eyebrow, heading, limit }) => {
  const posts = await getPosts({ limit: limit || 3 })

  if (!posts?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div data-reveal="up">
          {eyebrow && (
            <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
              {eyebrow}
            </span>
          )}
          {heading && (
            <h2 className="mt-3 max-w-xl text-3xl font-semibold md:text-5xl">{heading}</h2>
          )}
        </div>
        <Link
          href="/insights"
          data-reveal="up"
          className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
        >
          View all insights
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-3" data-reveal-group="120">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/insights/${post.slug}`}
            data-reveal="up"
            className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60"
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
            <div className="p-6">
              {post.publishedAt && (
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {formatDateTime(post.publishedAt)}
                </p>
              )}
              <h3 className="mt-2 text-lg font-semibold">{post.title}</h3>
              {post.meta?.description && (
                <p className="mt-2 text-sm text-muted-foreground">{post.meta.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
