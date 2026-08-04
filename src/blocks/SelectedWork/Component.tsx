import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import React from 'react'

import { getCaseStudies, safely } from '@/lib/api'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'
import { cn } from '@/utilities/ui'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  limit?: number | null
}

/**
 * Layout family: stacked header, asymmetric feature grid (first study runs
 * full width), action moved below the grid. Deliberately different from the
 * services tile grid above it so the page does not repeat one rhythm.
 */
export const SelectedWorkBlock: React.FC<Props> = async ({ eyebrow, heading, limit }) => {
  const caseStudies = await safely(
    () => getCaseStudies({ featuredOnHome: true, limit: limit || 3 }),
    [],
  )

  if (!caseStudies?.length) return null

  return (
    <section className="container py-20 md:py-28">
      <SectionHeading eyebrow={eyebrow} heading={heading} />

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
              <div
                className={cn(
                  'p-6',
                  featured && 'lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:p-10',
                )}
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {study.industry || study.clientName}
                </p>
                <h3 className={cn('mt-2 text-lg font-semibold', featured && 'lg:text-3xl')}>
                  {study.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{study.summary}</p>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-10 flex justify-center" data-reveal="up">
        <Link
          href="/case-studies"
          className="group inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-secondary hover:text-secondary"
        >
          View our work
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  )
}
