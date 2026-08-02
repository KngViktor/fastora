import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { getCaseStudies } from '@/lib/api'
import { Media } from '@/components/Media'
import { PageHeader } from '@/components/PageHeader'
import { generateMeta } from '@/utilities/generateMeta'
import { queryUtilityPage } from '@/utilities/queryUtilityPage'

const FALLBACK = {
  eyebrow: 'Case studies',
  heading: 'Results, not just deliverables',
  description: 'A look at how we help businesses communicate with more clarity, credibility, and confidence.',
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await queryUtilityPage('case-studies')
  return generateMeta({
    doc: page || {
      meta: { title: 'Case Studies', description: FALLBACK.description, image: null },
    },
  })
}

export default async function CaseStudiesPage() {
  const [page, caseStudies] = await Promise.all([
    queryUtilityPage('case-studies'),
    getCaseStudies({ limit: 100 }),
  ])
  const header = {
    eyebrow: page?.pageHeaderEyebrow || FALLBACK.eyebrow,
    heading: page?.pageHeaderHeading || FALLBACK.heading,
    description: page?.pageHeaderDescription || FALLBACK.description,
  }

  return (
    <div>
      <PageHeader eyebrow={header.eyebrow} title={header.heading} description={header.description} />

      <section className="container pb-24 pt-16">
        {caseStudies.length ? (
          <div className="grid gap-8 md:grid-cols-2" data-reveal-group="120">
            {caseStudies.map((study) => (
              <Link
                key={study.id}
                href={`/case-studies/${study.slug}`}
                data-reveal="up"
                className="group overflow-hidden rounded-3xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-secondary/60"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {study.coverImage && typeof study.coverImage === 'object' && (
                    <Media
                      resource={study.coverImage}
                      fill
                      imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-6 md:p-8">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {[study.clientName, study.industry].filter(Boolean).join(' · ')}
                  </p>
                  <h2 className="mt-2 text-xl font-semibold md:text-2xl">{study.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">{study.summary}</p>
                  {Array.isArray(study.results) && study.results.length > 0 && (
                    <div className="mt-6 flex flex-wrap gap-6">
                      {study.results.slice(0, 3).map((r, i) => (
                        <div key={i}>
                          <p className="font-display text-2xl font-semibold text-gradient-velocity">
                            {r.metric}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">{r.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No case studies published yet.</p>
        )}
      </section>
    </div>
  )
}
