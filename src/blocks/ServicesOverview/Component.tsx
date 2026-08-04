import Link from 'next/link'
import React from 'react'

import { getServices, safely } from '@/lib/api'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  limit?: number | null
}

/** Layout family: split header + edge-to-edge tile grid on the navy band. */
export const ServicesOverviewBlock: React.FC<Props> = async ({ eyebrow, heading, limit }) => {
  const services = await safely(() => getServices({ featuredOnHome: true, limit: limit || 6 }), [])

  if (!services?.length) return null

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container pt-4 pb-20 md:pt-[1.4rem] md:pb-28">
        <SectionHeading
          eyebrow={eyebrow}
          heading={heading}
          tone="dark"
          action={{ label: 'View all services', href: '/services' }}
        />

        <div
          className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-primary-foreground/10 bg-primary-foreground/10 sm:grid-cols-2"
          data-reveal-group="90"
        >
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
                {/* Ghosted running number, brightening to the accent on hover.
                    Positional rather than stored per service, so reordering in
                    the admin renumbers the grid automatically. */}
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
