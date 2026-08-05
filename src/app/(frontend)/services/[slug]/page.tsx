import type { Metadata } from 'next'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { getServiceBySlug, getServices, getTestimonials, safely } from '@/lib/api'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { PageHeader } from '@/components/PageHeader'
import { ConsultationFormBlock } from '@/blocks/ConsultationForm/Component'
import { buildBreadcrumbs } from '@/utilities/breadcrumbs'
import { generateMeta } from '@/utilities/generateMeta'
import { getServerSideURL } from '@/utilities/getURL'

export async function generateStaticParams() {
  const services = await safely(() => getServices(), [])
  return services.filter((doc) => Boolean(doc.slug)).map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

export default async function ServicePage({ params }: Args) {
  const { slug } = await params
  const service = await queryServiceBySlug({ slug })

  if (!service) notFound()

  const testimonials = await safely(
    () => getTestimonials({ relatedService: service.id, limit: 3 }),
    [],
  )

  // The API sends related services as slugs, so resolve them here against the
  // full list rather than making one request per link.
  const allServices = await safely(() => getServices(), [])
  const relatedServices = service.relatedServiceSlugs
    .map((slug) => allServices.find((candidate) => candidate.slug === slug))
    .filter((candidate): candidate is NonNullable<typeof candidate> => Boolean(candidate))

  const url = getServerSideURL()
  const hasFaqs = Array.isArray(service.faqs) && service.faqs.length > 0

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.title,
    name: service.title,
    description: service.summary,
    provider: { '@type': 'ProfessionalService', name: 'Fastora', url },
    url: `${url}/services/${service.slug}`,
  }

  const faqJsonLd = hasFaqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: service.faqs!.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : null

  const breadcrumbJsonLd = buildBreadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: service.title },
  ])

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <PageHeader eyebrow="Service" title={service.title} />

      {/* The document's "supporting copy": a few lines under the heading that
          frame the problem, ahead of the overview. Larger than body text because
          it belongs to the header rather than the article. */}
      {service.problem && (
        <div className="container pt-10 md:pt-14">
          <div
            data-reveal="up"
            className="max-w-2xl [&_p]:text-lg [&_p]:text-muted-foreground [&_p+p]:mt-4"
          >
            <RichText data={service.problem} enableGutter={false} enableProse={false} />
          </div>
        </div>
      )}

      <div className="container grid gap-16 py-20 md:py-28 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-14">
          {(service.overviewHeading || service.overviewCopy) && (
            <section data-reveal="up">
              {service.overviewHeading && (
                <h2 className="max-w-2xl text-2xl font-semibold md:text-3xl">
                  {service.overviewHeading}
                </h2>
              )}
              {service.overviewCopy && (
                <div className="mt-4">
                  <RichText data={service.overviewCopy} enableGutter={false} />
                </div>
              )}
            </section>
          )}

          {service.outcomes.length > 0 && (
            <section data-reveal="up">
              <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">
                What this helps you achieve
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {service.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-3 text-base">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-secondary"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    {o.label}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {service.deliverables.length > 0 && (
            <section data-reveal="up">
              <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">
                What&apos;s included
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">This service may include:</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {service.deliverables.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm"
                  >
                    <span className="mt-0.5 text-secondary">✓</span>
                    {d.label}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                The exact scope depends on the engagement.
              </p>
            </section>
          )}

          {service.approach && (
            <section data-reveal="up">
              <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">Our approach</h2>
              <div className="mt-4">
                <RichText data={service.approach} enableGutter={false} />
              </div>
            </section>
          )}

          {service.goodFitIf.length > 0 && (
            <section data-reveal="up">
              <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">
                This service is a good fit if…
              </h2>
              <ul className="mt-5 flex flex-col gap-3">
                {service.goodFitIf.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-base">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-secondary"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    {f.label}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {relatedServices.length > 0 && (
            <section data-reveal="up">
              <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">
                Related services
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">You may also need</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {relatedServices.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/services/${related.slug}`}
                    className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-secondary/60"
                  >
                    <p className="font-semibold transition-colors group-hover:text-secondary">
                      {related.title}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{related.summary}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {Array.isArray(service.faqs) && service.faqs.length > 0 && (
            <section data-reveal="up">
              <h2 className="text-2xl font-semibold">Frequently asked</h2>
              <div className="mt-6 divide-y divide-border overflow-hidden rounded-3xl border border-border">
                {service.faqs.map((faq, i) => (
                  <details key={i} className="group bg-card p-6 [&_summary]:cursor-pointer">
                    <summary className="flex items-center justify-between text-base font-medium marker:content-none">
                      {faq.question}
                      <span className="text-secondary transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="flex flex-col gap-8">
          {service.featuredImage && typeof service.featuredImage === 'object' && (
            <div className="overflow-hidden rounded-3xl border border-border">
              <Media resource={service.featuredImage} imgClassName="w-full object-cover" />
            </div>
          )}

          {testimonials.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6" data-reveal="up">
              <p className="text-sm font-medium uppercase tracking-wide text-secondary">What clients say</p>
              <div className="mt-4 flex flex-col gap-6">
                {testimonials.map((t) => (
                  <figure key={t.id}>
                    <blockquote className="text-sm leading-relaxed">“{t.quote}”</blockquote>
                    <figcaption className="mt-2 text-xs text-muted-foreground">
                      {[t.clientName, t.company].filter(Boolean).join(', ')}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          )}

          {/* Scrolls to the form below rather than leaving for /contact, so the
              service the reader just chose is carried into the request. */}
          <a
            href="#book"
            className="rounded-full bg-secondary px-6 py-3 text-center text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
          >
            Book a Consultation
          </a>
        </aside>
      </div>

      <ConsultationFormBlock
        id="book"
        eyebrow="Request a session"
        heading={service.ctaHeading || `Talk to us about ${service.title}`}
        description="Send two or three times that suit you and we'll confirm one by email. Sessions run over video, or by phone if you prefer."
        idealFor={[
          { label: 'Businesses preparing to grow' },
          { label: 'Founders refining positioning' },
          { label: 'Organisations reviewing communication' },
        ]}
        submitLabel="Request a session"
        reassurance="Within one business day we'll confirm one of your preferred times by email."
        service={{ id: service.id, title: service.title }}
      />
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const service = await queryServiceBySlug({ slug })
  return generateMeta({ doc: service, path: `/services/${slug}` })
}

const queryServiceBySlug = cache(async ({ slug }: { slug: string }) =>
  safely(() => getServiceBySlug(slug), null),
)
