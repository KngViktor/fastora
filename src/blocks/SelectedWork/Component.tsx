import Link from 'next/link'
import React from 'react'

import { getCaseStudies, safely } from '@/lib/api'
import { Media } from '@/components/Media'
import { SectionHeading } from '@/components/SectionHeading'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  limit?: number | null
}

/**
 * Every featured case study gets the same treatment: a text panel next to a
 * filmstrip of the case study's gallery images, styled after real social
 * screenshots rather than a single hero photo. Cards stack full width, one
 * per row, so a gallery of two images reads just as intentionally as one
 * of three.
 */
export const SelectedWorkBlock: React.FC<Props> = async ({
  eyebrow,
  heading,
  description,
  limit,
}) => {
  const caseStudies = await safely(
    () => getCaseStudies({ featuredOnHome: true, limit: limit || 3 }),
    [],
  )

  if (!caseStudies?.length) return null

  return (
    <section className="container py-12 md:py-16">
      <SectionHeading
        eyebrow={eyebrow}
        heading={heading}
        action={{ label: 'View all case studies', href: '/case-studies' }}
      />
      {description && (
        <p data-reveal="up" className="mt-4 max-w-2xl text-muted-foreground">
          {description}
        </p>
      )}

      <div className="mt-12 space-y-6" data-reveal-group="120">
        {caseStudies.map((study) => {
          const shots = study.gallery?.map((item) => item.image).slice(0, 3)

          return (
            <Link
              key={study.id}
              href={`/case-studies/${study.slug}`}
              data-reveal="up"
              className="group grid overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]"
            >
              <div className="flex flex-col justify-center p-8 md:p-10">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {study.industry || study.clientName}
                </p>
                <h3 className="mt-3 text-xl font-bold md:text-2xl">{study.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground md:text-base">{study.summary}</p>
              </div>

              {shots?.length ? (
                <div className="flex gap-2 bg-muted p-2 md:p-3">
                  {shots.map((image, i) => (
                    <div
                      key={i}
                      className="relative aspect-[9/16] flex-1 overflow-hidden rounded-xl"
                    >
                      <Media
                        resource={image}
                        fill
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                study.coverImage &&
                typeof study.coverImage === 'object' && (
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted md:aspect-auto">
                    <Media
                      resource={study.coverImage}
                      fill
                      imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
