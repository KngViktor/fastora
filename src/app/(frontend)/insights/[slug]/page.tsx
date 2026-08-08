import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { getPostBySlug, getPosts, safely } from '@/lib/api'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { NewsletterForm } from '@/components/NewsletterForm'
import { buildBreadcrumbs } from '@/utilities/breadcrumbs'
import { generateMeta } from '@/utilities/generateMeta'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateTime } from '@/utilities/formatDateTime'
import { getServerSideURL } from '@/utilities/getURL'

export async function generateStaticParams() {
  const posts = await safely(() => getPosts(), [])
  return posts.filter((doc) => Boolean(doc.slug)).map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

export default async function PostPage({ params }: Args) {
  const { slug } = await params
  const post = await queryPostBySlug({ slug })

  if (!post) notFound()

  const hasAuthors = post.authors && post.authors.length > 0 && formatAuthors(post.authors) !== ''

  const url = getServerSideURL()
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta?.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    ...(hasAuthors ? { author: { '@type': 'Person', name: formatAuthors(post.authors) } } : {}),
    publisher: { '@type': 'Organization', name: 'Fastora', url },
    mainEntityOfPage: `${url}/insights/${post.slug}`,
  }

  const breadcrumbJsonLd = buildBreadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Insights', path: '/insights' },
    { name: post.title },
  ])

  return (
    <article className="pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          className="animate-float pointer-events-none absolute -top-32 right-[-10%] h-[32rem] w-[32rem] rounded-full opacity-50 blur-3xl"
          style={{
            background: 'radial-gradient(circle at center, rgba(198,161,91,0.25), transparent 62%)',
          }}
        />
        <div className="container relative z-10 pt-28 pb-16 md:pt-36 md:pb-20" data-reveal-group="110">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-secondary" data-reveal="up">
            {Array.isArray(post.categories) &&
              post.categories.map((c) => <span key={c.id}>{c.title}</span>)}
          </div>
          <h1 data-reveal="up" className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] md:text-6xl">
            {post.title}
          </h1>
          <div data-reveal="up" className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-sm text-primary-foreground/70">
            {hasAuthors && <span>By {formatAuthors(post.authors)}</span>}
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>{formatDateTime(post.publishedAt)}</time>
            )}
          </div>
        </div>
      </header>

      {post.heroImage && typeof post.heroImage === 'object' && (
        <div className="container -mt-8" data-reveal="scale">
          <div className="overflow-hidden rounded-3xl border border-border">
            <Media resource={post.heroImage} imgClassName="w-full object-cover" />
          </div>
        </div>
      )}

      <div className="py-16">
        <RichText data={post.content} enableGutter />
      </div>

      {Array.isArray(post.tags) && post.tags.length > 0 && (
        <div className="container flex flex-wrap gap-2">
          {post.tags.map((tag, i) => (
            <span
              key={i}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="container mt-16" data-reveal="up">
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-8 text-center md:p-10">
          <h2 className="text-xl font-semibold md:text-2xl">Enjoyed this article?</h2>
          <p className="mt-2 text-sm text-muted-foreground">Receive the next one in your inbox.</p>
          <NewsletterForm variant="light" source="insights-article" />
        </div>
      </div>

      <div className="container mt-10 text-center">
        <Link
          href="/insights"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to all insights
        </Link>
      </div>
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const post = await queryPostBySlug({ slug })
  return generateMeta({ doc: post, path: `/insights/${slug}` })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) =>
  safely(() => getPostBySlug(slug), null),
)
