import type { Metadata } from 'next'
import React from 'react'

import { DEFAULT_SITE_SETTINGS, getSiteSettings, safely } from '@/lib/api'
import { PageHeader } from '@/components/PageHeader'
import { FAQBlockComponent } from '@/blocks/FAQ/Component'
import { generateMeta } from '@/utilities/generateMeta'
import { queryUtilityPage } from '@/utilities/queryUtilityPage'
import { ContactForm } from './ContactForm'

const FALLBACK = {
  eyebrow: 'Contact',
  heading: "Let's talk about your business.",
  description:
    "Every project starts with a conversation. Tell us what you're working on, where you'd like to go, or the challenge you're trying to solve. We'll take it from there.",
}

const AFTER_CONTACT_STEPS = [
  { title: "We'll read through your message." },
  { title: "If it looks like we're a good fit, we'll get in touch to arrange a conversation." },
  { title: "From there, we'll recommend the best next step for your business." },
]

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
  const [page, siteSettings] = await Promise.all([
    queryUtilityPage('contact'),
    safely(() => getSiteSettings(), DEFAULT_SITE_SETTINGS),
  ])
  const header = {
    eyebrow: page?.pageHeaderEyebrow || FALLBACK.eyebrow,
    heading: page?.pageHeaderHeading || FALLBACK.heading,
    description: page?.pageHeaderDescription || FALLBACK.description,
  }

  return (
    <div>
      <PageHeader
        eyebrow={header.eyebrow}
        title={header.heading}
        description={header.description}
      />

      <section className="container grid grid-cols-1 gap-12 py-20 md:py-24 lg:grid-cols-[1fr_18rem]">
        <div data-reveal="up" className="rounded-3xl border border-border bg-card p-6 md:p-10">
          <p className="mb-8 text-lg text-muted-foreground">
            Every good partnership starts with a conversation. We&apos;re looking forward to
            hearing about your business and learning how we can help.
          </p>
          <ContactForm />
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
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-secondary">
              Response Time
            </p>
            <p className="mt-2 text-sm text-muted-foreground">Within one business day.</p>
          </div>
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-secondary">
              Where We Work
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Based in Nigeria, serving clients across Africa, Europe, North America, and
              Australia.
            </p>
          </div>
        </aside>
      </section>

      <section className="container pb-20 md:pb-28">
        <h2 className="max-w-xl text-3xl font-semibold md:text-4xl" data-reveal="up">
          What happens after you get in touch?
        </h2>
        <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3" data-reveal-group="110">
          {AFTER_CONTACT_STEPS.map((step, i) => (
            <li key={i} data-reveal="up">
              <span className="font-display text-3xl font-semibold text-gold">
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="mt-3 text-base">{step.title}</p>
            </li>
          ))}
        </ol>
      </section>

      <FAQBlockComponent heading="Frequently Asked Questions" items={page?.faqs} />
    </div>
  )
}
