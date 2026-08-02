import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { getServices, safely } from '@/lib/api'
import { Media } from '@/components/Media'
import { PageHeader } from '@/components/PageHeader'
import { FAQBlockComponent } from '@/blocks/FAQ/Component'
import { generateMeta } from '@/utilities/generateMeta'
import { queryUtilityPage } from '@/utilities/queryUtilityPage'

const SERVICES_FAQS = [
  {
    question: 'How do I know which service is right for us?',
    answer:
      "Book a consultation and we'll help you figure out the right starting point, most engagements begin with Strategic Communications or Brand Consulting before moving into execution.",
  },
  {
    question: 'Can we combine multiple services?',
    answer:
      'Yes. Most clients combine two or three services, strategy, content, and digital marketing are a common pairing, delivered as one connected engagement.',
  },
  {
    question: 'Do you offer one-off projects or only retainers?',
    answer:
      'Both. Some services, like Brand Consulting, work well as defined projects. Others, like Social Media Management and Communication Advisory, are typically ongoing retainers.',
  },
]

const FALLBACK = {
  eyebrow: 'What we do',
  heading: 'Services built around how you communicate',
  description:
    'Ten integrated services, each designed to help your business communicate with more clarity, credibility, and confidence.',
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryUtilityPage('services')
  return generateMeta({
    doc: page || {
      meta: { title: 'Services', description: FALLBACK.description, image: null },
    },
  })
}

export default async function ServicesPage() {
  const [page, services] = await Promise.all([
    queryUtilityPage('services'),
    safely(() => getServices({ limit: 100 }), []),
  ])
  const header = {
    eyebrow: page?.pageHeaderEyebrow || FALLBACK.eyebrow,
    heading: page?.pageHeaderHeading || FALLBACK.heading,
    description: page?.pageHeaderDescription || FALLBACK.description,
  }

  return (
    <div>
      <PageHeader eyebrow={header.eyebrow} title={header.heading} description={header.description} />

      <section className="container pb-24">
        {services.length ? (
          <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2" data-reveal-group="90">
            {services.map((service, i) => (
              <Link
                key={service.id}
                href={`/services/${service.slug}`}
                data-reveal="up"
                className="group flex flex-col justify-between gap-10 bg-background p-8 transition-colors hover:bg-card md:p-10"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    {service.icon && typeof service.icon === 'object' && (
                      <Media
                        resource={service.icon}
                        htmlElement={null}
                        imgClassName="h-9 w-9 object-contain"
                      />
                    )}
                    <h2 className="mt-6 text-2xl font-semibold">{service.title}</h2>
                    <p className="mt-3 max-w-sm text-sm text-muted-foreground">{service.summary}</p>
                  </div>
                  <span className="font-display text-5xl font-semibold text-border transition-colors group-hover:text-secondary">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                  Explore service →
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No services published yet.</p>
        )}
      </section>

      <FAQBlockComponent heading="Questions about our services" items={SERVICES_FAQS} />
    </div>
  )
}
