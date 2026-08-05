import type { Metadata } from 'next'
import React from 'react'

import { DEFAULT_SITE_SETTINGS, getServices, getSiteSettings, safely } from '@/lib/api'
import { PageHeader } from '@/components/PageHeader'
import { FAQBlockComponent } from '@/blocks/FAQ/Component'
import { generateMeta } from '@/utilities/generateMeta'
import { queryUtilityPage } from '@/utilities/queryUtilityPage'
import { ContactForm } from './ContactForm'

const FALLBACK = {
  eyebrow: 'Contact',
  heading: "Let's start your project",
  description: "Tell us where you want to go. We'll come back with how to get there, fast.",
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryUtilityPage('contact')
  return generateMeta({
    doc: page || {
      meta: { title: 'Contact', description: FALLBACK.description, image: null, canonicalUrl: null, noindex: false },
    },
    path: '/contact',
  })
}

export default async function ContactPage() {
  const [page, services, siteSettings] = await Promise.all([
    queryUtilityPage('contact'),
    safely(() => getServices({ limit: 100 }), []),
    safely(() => getSiteSettings(), DEFAULT_SITE_SETTINGS),
  ])
  const header = {
    eyebrow: page?.pageHeaderEyebrow || FALLBACK.eyebrow,
    heading: page?.pageHeaderHeading || FALLBACK.heading,
    description: page?.pageHeaderDescription || FALLBACK.description,
  }

  const serviceOptions = services.map((s) => ({ id: s.id, title: s.title }))

  return (
    <div>
      <PageHeader
        eyebrow={header.eyebrow}
        title={header.heading}
        description={header.description}
      />

      <section className="container grid grid-cols-1 gap-12 py-20 md:py-24 lg:grid-cols-[1fr_18rem]">
        <div data-reveal="up" className="rounded-3xl border border-border bg-card p-6 md:p-10">
          <ContactForm services={serviceOptions} />
        </div>

        <aside className="flex flex-col gap-8" data-reveal="up">
          {siteSettings?.contactEmail && (
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-secondary">Email</p>
              <a
                href={`mailto:${siteSettings.contactEmail}`}
                className="mt-2 block text-sm hover:text-secondary"
              >
                {siteSettings.contactEmail}
              </a>
            </div>
          )}
          {siteSettings?.contactPhone && (
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-secondary">Phone</p>
              <a
                href={`tel:${siteSettings.contactPhone}`}
                className="mt-2 block text-sm hover:text-secondary"
              >
                {siteSettings.contactPhone}
              </a>
            </div>
          )}
          {siteSettings?.address && (
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-secondary">Studio</p>
              <p className="mt-2 text-sm text-muted-foreground">{siteSettings.address}</p>
            </div>
          )}
        </aside>
      </section>

      <FAQBlockComponent heading="Questions before you reach out" items={page?.faqs} />
    </div>
  )
}
