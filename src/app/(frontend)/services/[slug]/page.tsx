import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { getServiceBySlug, getServices, getTestimonials, safely } from '@/lib/api'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { PageHeader } from '@/components/PageHeader'
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

  const testimonials = await getTestimonials({ relatedService: service.id, limit: 3 })

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

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <PageHeader eyebrow="Service" title={service.title} description={service.summary} />

      <div className="container grid gap-16 py-20 md:py-28 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-14">
          {service.problem && (
            <section data-reveal="up">
              <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">The problem</h2>
              <div className="mt-4">
                <RichText data={service.problem} enableGutter={false} />
              </div>
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

          {Array.isArray(service.deliverables) && service.deliverables.length > 0 && (
            <section data-reveal="up">
              <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">Deliverables</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {service.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm">
                    <span className="mt-0.5 text-secondary">✓</span>
                    {d.label}
                  </li>
                ))}
              </ul>
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

          <Link
            href="/contact"
            className="rounded-full bg-secondary px-6 py-3 text-center text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
          >
            Book a Consultation
          </Link>
        </aside>
      </div>
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const service = await queryServiceBySlug({ slug })
  return generateMeta({ doc: service })
}

const queryServiceBySlug = cache(async ({ slug }: { slug: string }) => getServiceBySlug(slug))
