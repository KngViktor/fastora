import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import React from 'react'

import { getPosts, safely } from '@/lib/api'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { formatDateTime } from '@/utilities/formatDateTime'

type Props = {
  heading?: string | null
  limit?: number | null
}

/**
 * Layout family: editorial index rows. The three-card grid this used to be
 * was the third identical "header + card grid" section on the home page, so
 * the same content is presented as a reading list instead.
 */
export const LatestInsightsBlockComponent: React.FC<Props> = async ({ heading, limit }) => {
  const posts = await safely(() => getPosts({ limit: limit || 3 }), [])

  if (!posts?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <SectionHeading
        heading={heading}
        action={{ label: 'View all insights', href: '/insights' }}
      />

      <ul className="mt-12 divide-y divide-border border-t border-border" data-reveal-group="90">
        {posts.map((post) => (
          <li key={post.id} data-reveal="up">
            <Link
              href={`/insights/${post.slug}`}
              className="group flex items-center gap-6 py-6 md:gap-10 md:py-8"
            >
              <div className="min-w-0 flex-1">
                {post.publishedAt && (
                  <time
                    dateTime={post.publishedAt}
                    className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {formatDateTime(post.publishedAt)}
                  </time>
                )}
                <h3 className="mt-2 text-xl font-semibold transition-colors group-hover:text-secondary md:text-3xl">
                  {post.title}
                </h3>
                {post.meta?.description && (
                  <p className="mt-2 line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                    {post.meta.description}
                  </p>
                )}
              </div>

              {post.heroImage && typeof post.heroImage === 'object' && (
                <div className="relative hidden aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:block md:w-40">
                  <Media
                    resource={post.heroImage}
                    fill
                    imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              )}

              <ArrowUpRight
                className="h-5 w-5 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-secondary"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
