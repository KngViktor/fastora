import type { Metadata } from 'next'
import { Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { getPostBySlug, getPosts, safely } from '@/lib/api'
import RichText from '@/components/RichText'
import { ArticleAudio } from '@/components/ArticleAudio'
import { ArticleToc } from '@/components/ArticleToc'
import { Media } from '@/components/Media'
import { NewsletterForm } from '@/components/NewsletterForm'
import { ShareArticle } from '@/components/ShareArticle'
import { buildArticleToc, MIN_TOC_HEADINGS } from '@/utilities/articleToc'
import { htmlToPlainText } from '@/utilities/htmlText'
import { buildBreadcrumbs } from '@/utilities/breadcrumbs'
import { generateMeta } from '@/utilities/generateMeta'
import { formatAuthors } from '@/utilities/formatAuthors'
import { formatDateLong } from '@/utilities/formatDateTime'
import { getServerSideURL } from '@/utilities/getURL'
import { resolveOrDefer } from '@/utilities/resolveOrDefer'

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
  const postUrl = `${url}/insights/${post.slug}`

  // Headings get their anchors here, before the HTML is handed to RichText, so
  // the contents list beside the article has something to point at.
  const { html, headings } = buildArticleToc(post.content)

  // Flattened here rather than in the player: the server already holds the
  // authored HTML, and reading it off the DOM would speak whatever the
  // stylesheet happened to leave visible.
  const articleText = htmlToPlainText(post.content)

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.meta?.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    ...(hasAuthors ? { author: { '@type': 'Person', name: formatAuthors(post.authors) } } : {}),
    publisher: { '@type': 'Organization', name: 'Fastora', url },
    mainEntityOfPage: postUrl,
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

      {/* The title sits on a card lifted over the brand band rather than
          directly on it. It carries the eye to where the article actually
          starts, and keeps the headline on the same surface as the body text
          it introduces. */}
      <header className="relative overflow-hidden bg-primary pt-20 pb-36 text-primary-foreground md:pt-24 md:pb-44">
        <div
          className="animate-float pointer-events-none absolute -top-32 right-[-10%] h-[32rem] w-[32rem] rounded-full opacity-50 blur-3xl"
          style={{
            background: 'radial-gradient(circle at center, rgba(198,161,91,0.25), transparent 62%)',
          }}
        />
      </header>

      <div className="container relative z-10 -mt-28 md:-mt-36" data-reveal="up">
        <div className="rounded-3xl border border-border bg-card px-6 py-10 shadow-sm md:px-14 md:py-14">
          {Array.isArray(post.categories) && post.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium uppercase tracking-wide text-secondary">
              {post.categories.map((c) => (
                <span key={c.id}>{c.title}</span>
              ))}
            </div>
          )}

          <h1 className="mt-4 max-w-4xl text-3xl font-semibold leading-[1.1] md:text-5xl">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
            {hasAuthors && <span>By {formatAuthors(post.authors)}</span>}
            {hasAuthors && post.publishedAt && <span aria-hidden="true">&middot;</span>}
            {post.publishedAt && (
              <time dateTime={post.publishedAt}>{formatDateLong(post.publishedAt)}</time>
            )}
            <span aria-hidden="true">&middot;</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {post.readingTimeMinutes} min read
            </span>
          </div>
        </div>
      </div>

      {/* Contents and sharing ride alongside the article on a wide screen and
          stack above it on a narrow one, where a sticky rail would eat the
          screen the article needs. */}
      <div className="container mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-16">
        {/* On a phone the rail follows the article instead of delaying it:
            the contents list is hidden there, and share links belong at the
            end of a read rather than before it. */}
        <aside className="order-last lg:order-none lg:sticky lg:top-28 lg:self-start">
          <div className="hidden lg:block">
            <ArticleToc headings={headings} />
          </div>

          {/* A post too short to list sections still gets share links, but the
              rule above them would then be a line under nothing — as it would
              on mobile, where the list above it is hidden either way. */}
          <div
            className={
              headings.length >= MIN_TOC_HEADINGS
                ? 'lg:mt-10 lg:border-t lg:border-border lg:pt-8'
                : undefined
            }
          >
            <ShareArticle url={postUrl} title={post.title} />
          </div>
        </aside>

        <div className="min-w-0">
          <ArticleAudio text={articleText} />

          {post.heroImage && typeof post.heroImage === 'object' && (
            <div className="mb-10 overflow-hidden rounded-3xl border border-border" data-reveal="scale">
              <Media resource={post.heroImage} imgClassName="w-full object-cover" />
            </div>
          )}

          <RichText data={html} enableGutter={false} />

          {/* `!== false` rather than truthy, so it still shows if the API
              predates the toggle and leaves the field out. */}
          {post.showJournalNote !== false && (
            <aside aria-label="About Fastora's Journal" className="mt-16" data-reveal="up">
              <div className="rounded-3xl bg-primary px-6 py-12 text-primary-foreground md:px-14 md:py-16">
                <p className="text-lg leading-relaxed text-primary-foreground/70 md:text-2xl">
                  This article is part of Fastora&apos;s Journal on{' '}
                  <strong className="font-semibold text-primary-foreground">
                    branding, communication and the way people make decisions.
                  </strong>
                </p>
                <div className="mt-10 flex flex-col gap-4">
                  <Link
                    href="/insights"
                    className="rounded-full bg-white px-6 py-4 text-center text-base font-semibold text-primary transition-colors hover:bg-white/90"
                  >
                    Read more from the Journal
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full bg-black px-6 py-4 text-center text-base font-semibold text-white transition-colors hover:bg-black/80"
                  >
                    Work with Fastora
                  </Link>
                </div>
              </div>
            </aside>
          )}

          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
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
        </div>
      </div>

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

// Not wrapped in safely(), for the reason set out in app/(frontend)/[slug]:
// null here means notFound(), so swallowing a failed request turned a brief API
// outage into a cached 404 on a page that exists.
const queryPostBySlug = cache(async ({ slug }: { slug: string }) =>
  resolveOrDefer(() => getPostBySlug(slug)),
)
