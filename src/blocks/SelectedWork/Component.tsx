import Link from 'next/link'
import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { SelectedWorkBlock as SelectedWorkBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

export const SelectedWorkBlock: React.FC<SelectedWorkBlockProps> = async ({
  eyebrow,
  heading,
  limit,
}) => {
  const payload = await getPayload({ config: configPromise })

  const { docs: caseStudies } = await payload.find({
    collection: 'case-studies',
    depth: 1,
    limit: limit || 3,
    sort: 'order',
    where: {
      featuredOnHome: { equals: true },
    },
  })

  if (!caseStudies?.length) return null

  return (
    <section className="container py-20 md:py-28">
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
          href="/case-studies"
          data-reveal="up"
          className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
        >
          View all case studies
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2" data-reveal-group="120">
        {caseStudies.map((study, i) => {
          const featured = i === 0
          return (
            <Link
              key={study.id}
              href={`/case-studies/${study.slug}`}
              data-reveal="up"
              className={cn(
                'group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60',
                featured && 'lg:col-span-2 lg:flex lg:flex-row-reverse',
              )}
            >
              <div
                className={cn(
                  'relative aspect-[4/3] overflow-hidden bg-muted',
                  featured && 'lg:aspect-auto lg:w-1/2',
                )}
              >
                {study.coverImage && typeof study.coverImage === 'object' && (
                  <Media
                    resource={study.coverImage}
                    fill
                    imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
              </div>
              <div className={cn('p-6', featured && 'lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:p-10')}>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {study.industry || study.clientName}
                </p>
                <h3 className={cn('mt-2 text-lg font-semibold', featured && 'lg:text-2xl')}>
                  {study.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{study.summary}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
