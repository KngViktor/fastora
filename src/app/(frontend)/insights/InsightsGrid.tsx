'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'

import type { Post } from '@/lib/api'
import { Media } from '@/components/Media'
import { formatDateTime } from '@/utilities/formatDateTime'

type Props = {
  posts: Post[]
}

const ALL_TOPIC = 'All'

/**
 * The content document's fixed topic list, not derived from whatever
 * categories happen to have a post in them yet — a pill for "Founder
 * Branding" should exist before the first Founder Branding post does.
 */
const TOPICS = [
  ALL_TOPIC,
  'Communication',
  'Branding',
  'Content',
  'Digital Marketing',
  'Strategy',
  'Founder Branding',
]

/** Article card: category, reading time, title, summary, published date. */
const PostCard: React.FC<{ post: Post }> = ({ post }) => (
  <Link
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
        {post.categories.map((c) => (
          <span key={c.id} className="text-secondary">
            {c.title}
          </span>
        ))}
        <span>· {post.readingTimeMinutes} min read</span>
      </div>
      <h2 className="mt-3 text-lg font-semibold">{post.title}</h2>
      {post.meta?.description && (
        <p className="mt-2 text-sm text-muted-foreground">{post.meta.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-4">
        {post.publishedAt && (
          <time dateTime={post.publishedAt} className="text-xs text-muted-foreground">
            {formatDateTime(post.publishedAt)}
          </time>
        )}
        <span className="inline-flex items-center gap-1 text-sm font-medium text-secondary opacity-0 transition-opacity group-hover:opacity-100">
          Read article →
        </span>
      </div>
    </div>
  </Link>
)

/** True if any word in the query appears in the title, summary, or category names. */
function matchesSearch(post: Post, query: string): boolean {
  const haystack = [post.title, post.meta?.description, ...post.categories.map((c) => c.title)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word))
}

/**
 * A search box plus "browse by topic" pills over the article grid.
 *
 * Both filter client-side against the posts already fetched by the server
 * component, rather than a fresh request per keystroke or click — with a
 * couple of dozen posts at most, that's simpler and faster than
 * round-tripping to the API.
 */
export const InsightsGrid: React.FC<Props> = ({ posts }) => {
  const [activeTopic, setActiveTopic] = useState(ALL_TOPIC)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return posts
      .filter((post) => activeTopic === ALL_TOPIC || post.categories.some((c) => c.title === activeTopic))
      .filter((post) => matchesSearch(post, query))
  }, [posts, activeTopic, query])

  if (posts.length === 0) {
    return <p className="text-muted-foreground">No insights published yet.</p>
  }

  return (
    <div>
      <div className="pb-6" data-reveal="up">
        <div className="relative max-w-md">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search our posts…"
            aria-label="Search insights"
            className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/40"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-10" data-reveal="up">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => setActiveTopic(topic)}
            aria-pressed={activeTopic === topic}
            className={
              activeTopic === topic
                ? 'rounded-full bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground'
                : 'rounded-full border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-secondary hover:text-secondary'
            }
          >
            {topic}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3" data-reveal-group="110">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          {query ? `No posts match "${query}".` : `Nothing under ${activeTopic} yet.`}
        </p>
      )}
    </div>
  )
}
