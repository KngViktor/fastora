import Link from 'next/link'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { ServicesOverviewBlock as ServicesOverviewBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'

export const ServicesOverviewBlock: React.FC<ServicesOverviewBlockProps> = async ({
  eyebrow,
  heading,
  limit,
}) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: services } = await payload.find({
    collection: 'services',
    depth: 1,
    limit: limit || 6,
    sort: 'order',
    where: {
      featuredOnHome: { equals: true },
    },
  })

  if (!services?.length) return null

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container pt-4 pb-20 md:pt-[1.4rem] md:pb-28">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div data-reveal="up">
            {eyebrow && (
              <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                {eyebrow}
              </span>
            )}
            {heading && (
              <h2 className="mt-3 max-w-xl text-3xl font-semibold md:text-5xl">{heading}</h2>
            )}
          </div>
          <Link
            href="/services"
            data-reveal="up"
            className="group inline-flex items-center gap-2 text-sm font-medium text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            View all services
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-primary-foreground/10 bg-primary-foreground/10 sm:grid-cols-2 lg:grid-cols-2" data-reveal-group="90">
          {services.map((service, i) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              data-reveal="up"
              className="group relative flex flex-col justify-between gap-10 bg-primary p-8 transition-colors hover:bg-card md:p-10"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {service.icon && typeof service.icon === 'object' && (
                    <Media
                      resource={service.icon}
                      imgClassName="h-9 w-9 object-contain"
                      htmlElement={null}
                    />
                  )}
                  <h3 className="mt-6 text-2xl font-semibold transition-colors group-hover:text-primary">
                    {service.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm text-primary-foreground/60 transition-colors group-hover:text-primary/70">
                    {service.summary}
                  </p>
                </div>
                <span className="font-display text-5xl font-semibold text-primary-foreground/15 transition-colors group-hover:text-secondary md:text-6xl">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-secondary opacity-0 transition-opacity group-hover:opacity-100">
                Learn more →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
