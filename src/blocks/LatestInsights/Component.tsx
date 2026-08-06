import Link from 'next/link'
import React from 'react'

import { getPosts, safely } from '@/lib/api'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { formatDateTime } from '@/utilities/formatDateTime'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  limit?: number | null
}

/** Three-card grid, matching the case studies cards directly above it. */
export const LatestInsightsBlockComponent: React.FC<Props> = async ({
  eyebrow,
  heading,
  description,
  limit,
}) => {
  const posts = await safely(() => getPosts({ limit: limit || 3 }), [])

  if (!posts?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <SectionHeading
        eyebrow={eyebrow}
        heading={heading}
        action={{ label: 'View all insights', href: '/insights' }}
      />
      {description && (
        <p data-reveal="up" className="mt-4 max-w-2xl text-muted-foreground">
          {description}
        </p>
      )}

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3" data-reveal-group="120">
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
                <time
                  dateTime={post.publishedAt}
                  className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {formatDateTime(post.publishedAt)}
                </time>
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
