import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import type { CaseStudy } from '@/lib/api'
import { getCaseStudies, getCaseStudyBySlug, safely } from '@/lib/api'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { PageHeader } from '@/components/PageHeader'
import { buildBreadcrumbs } from '@/utilities/breadcrumbs'
import { generateMeta } from '@/utilities/generateMeta'

export async function generateStaticParams() {
  const studies = await safely(() => getCaseStudies(), [])
  return studies.filter((doc) => Boolean(doc.slug)).map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

/** A narrative section: small accent heading, rich text under it. */
const Section: React.FC<{ heading: string; body: string | null | undefined }> = ({
  heading,
  body,
}) =>
  body ? (
    <section data-reveal="up">
      <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">{heading}</h2>
      <div className="mt-4">
        <RichText data={body} enableGutter={false} />
      </div>
    </section>
  ) : null

/**
 * The numbers, with whatever heading and framing the study gives them. Sits
 * either before or after "What we did" — see `resultsPlacement`.
 */
const Results: React.FC<{ study: CaseStudy }> = ({ study }) => {
  if (!Array.isArray(study.results) || study.results.length === 0) return null

  return (
    <section data-reveal="up">
      <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">
        {study.resultsHeading || 'What changed'}
      </h2>
      {study.resultsIntro && (
        <div className="mt-4">
          <RichText data={study.resultsIntro} enableGutter={false} />
        </div>
      )}
      <div
        className="mt-6 grid grid-cols-1 gap-8 rounded-3xl border border-border bg-card p-8 sm:grid-cols-2 md:p-10"
        data-reveal-group="90"
      >
        {study.results.map((r, i) => (
          <div key={i} data-reveal="up">
            <p className="font-display text-3xl font-semibold text-gold md:text-4xl">{r.metric}</p>
            <p className="mt-2 text-sm text-muted-foreground">{r.label}</p>
          </div>
        ))}
      </div>
      {study.resultsNote && (
        <div className="mt-6">
          <RichText data={study.resultsNote} enableGutter={false} />
        </div>
      )}
    </section>
  )
}

export default async function CaseStudyPage({ params }: Args) {
  const { slug } = await params
  const study = await queryCaseStudyBySlug({ slug })

  if (!study) notFound()

  const breadcrumbJsonLd = buildBreadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: study.title },
  ])

  // Three studies report their numbers at the end; Unity Key reports them up
  // front, as the audit that prompted the work.
  const resultsFirst = study.resultsPlacement === 'after_thinking'

  const facts = [
    { label: 'Client', value: study.clientName },
    { label: 'Industry', value: study.industry },
    { label: 'Location', value: study.location },
    { label: 'Engagement', value: study.engagement },
  ].filter((fact) => Boolean(fact.value))

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <PageHeader eyebrow={study.industry || undefined} title={study.title} />

      {study.heroIntro && (
        <div className="container pt-10 md:pt-14">
          <div
            data-reveal="up"
            className="max-w-2xl [&_p]:text-lg [&_p]:text-muted-foreground [&_p+p]:mt-4"
          >
            <RichText data={study.heroIntro} enableGutter={false} enableProse={false} />
          </div>
        </div>
      )}

      {study.coverImage && typeof study.coverImage === 'object' && (
        <div className="container pt-10 md:pt-14" data-reveal="scale">
          <div className="overflow-hidden rounded-3xl border border-border">
            <Media resource={study.coverImage} imgClassName="w-full object-cover" />
          </div>
        </div>
      )}

      <div className="container grid grid-cols-1 gap-16 py-12 md:py-16 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-14">
          <Section heading="The business" body={study.theBusiness} />
          <Section heading="What we noticed" body={study.whatWeNoticed} />
          <Section heading="Our thinking" body={study.ourThinking} />

          {resultsFirst && <Results study={study} />}

          <Section heading="What we did" body={study.whatWeDid} />

          {study.gallery.length > 0 && (
            <section className="flex flex-col gap-8" data-reveal-group="100">
              {study.gallery.map((item, i) => (
                <figure key={i} data-reveal="up">
                  <div className="overflow-hidden rounded-3xl border border-border">
                    <Media resource={item.image} imgClassName="w-full object-cover" />
                  </div>
                  {item.caption && (
                    <figcaption className="mt-3 text-sm text-muted-foreground">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </section>
          )}

          {!resultsFirst && <Results study={study} />}

          {study.testimonial && (
            <figure
              className="rounded-3xl border border-border bg-card p-8 md:p-10"
              data-reveal="up"
            >
              <blockquote className="text-lg leading-relaxed md:text-xl">
                &ldquo;{study.testimonial.quote}&rdquo;
              </blockquote>
              {(study.testimonial.author || study.testimonial.role) && (
                <figcaption className="mt-5 text-sm text-muted-foreground">
                  {study.testimonial.author}
                  {study.testimonial.author && study.testimonial.role && ', '}
                  {study.testimonial.role}
                </figcaption>
              )}
            </figure>
          )}

          {study.standoutCopy && (
            <Section
              heading={study.standoutHeading || 'One moment that stood out'}
              body={study.standoutCopy}
            />
          )}

          {study.takeawayCopy && (
            <Section heading={study.takeawayHeading || 'One takeaway'} body={study.takeawayCopy} />
          )}

          {study.relatedServices.length > 0 && (
            <section data-reveal="up">
              <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">
                Related services
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">You may also be interested in:</p>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {study.relatedServices.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/services/${related.slug}`}
                    className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-secondary/60"
                  >
                    <p className="font-semibold transition-colors group-hover:text-secondary">
                      {related.title}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
          {(facts.length > 0 || study.serviceLabels.length > 0) && (
            <div className="rounded-3xl border border-border bg-card p-6" data-reveal="up">
              <dl className="flex flex-col gap-5">
                {facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium">{fact.value}</dd>
                  </div>
                ))}
                {study.serviceLabels.length > 0 && (
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Services
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-2">
                      {study.serviceLabels.map((label) => (
                        <span
                          key={label}
                          className="rounded-full border border-border px-3 py-1 text-xs"
                        >
                          {label}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          <Link
            href="/consultation"
            className="rounded-full bg-secondary px-6 py-3 text-center text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
          >
            {study.ctaLabel || 'Book a Conversation'}
          </Link>
        </aside>
      </div>

      {(study.ctaHeading || study.ctaCopy) && (
        <section className="border-t border-border bg-card">
          <div className="container py-16 text-center md:py-20" data-reveal="up">
            {study.ctaHeading && (
              <h2 className="text-2xl font-semibold md:text-3xl">{study.ctaHeading}</h2>
            )}
            {study.ctaCopy && (
              <div className="mx-auto mt-4 max-w-xl [&_p]:text-muted-foreground [&_p+p]:mt-2">
                <RichText data={study.ctaCopy} enableGutter={false} enableProse={false} />
              </div>
            )}
            <Link
              href="/consultation"
              className="mt-8 inline-block rounded-full bg-secondary px-8 py-3 text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
            >
              {study.ctaLabel || 'Book a Conversation'}
            </Link>
          </div>
        </section>
      )}

      <section className="container py-12 text-center">
        <Link
          href="/case-studies"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to all case studies
        </Link>
      </section>
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const study = await queryCaseStudyBySlug({ slug })
  return generateMeta({ doc: study, path: `/case-studies/${slug}` })
}

const queryCaseStudyBySlug = cache(async ({ slug }: { slug: string }) =>
  safely(() => getCaseStudyBySlug(slug), null),
)
