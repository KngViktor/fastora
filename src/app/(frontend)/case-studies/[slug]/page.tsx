import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { getCaseStudies, getCaseStudyBySlug, safely } from '@/lib/api'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { PageHeader } from '@/components/PageHeader'
import { generateMeta } from '@/utilities/generateMeta'

export async function generateStaticParams() {
  const studies = await safely(() => getCaseStudies(), [])
  return studies.filter((doc) => Boolean(doc.slug)).map(({ slug }) => ({ slug }))
}

type Args = { params: Promise<{ slug: string }> }

export default async function CaseStudyPage({ params }: Args) {
  const { slug } = await params
  const study = await queryCaseStudyBySlug({ slug })

  if (!study) notFound()

  return (
    <article>
      <PageHeader
        eyebrow={[study.clientName, study.industry].filter(Boolean).join(' · ')}
        title={study.title}
        description={study.summary}
      />

      {study.coverImage && typeof study.coverImage === 'object' && (
        <div className="container -mt-8" data-reveal="scale">
          <div className="overflow-hidden rounded-3xl border border-border">
            <Media resource={study.coverImage} imgClassName="w-full object-cover" />
          </div>
        </div>
      )}

      {Array.isArray(study.results) && study.results.length > 0 && (
        <section className="container py-16 md:py-20">
          <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 sm:grid-cols-3 md:p-12" data-reveal-group="90">
            {study.results.map((r, i) => (
              <div key={i} data-reveal="up">
                <p className="font-display text-4xl font-semibold text-gradient-velocity md:text-5xl">
                  {r.metric}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{r.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="container grid gap-14 pb-16 md:grid-cols-2">
        {study.challenge && (
          <section data-reveal="up">
            <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">The challenge</h2>
            <div className="mt-4">
              <RichText data={study.challenge} enableGutter={false} />
            </div>
          </section>
        )}
        {study.approach && (
          <section data-reveal="up">
            <h2 className="text-sm font-medium uppercase tracking-wide text-secondary">Our approach</h2>
            <div className="mt-4">
              <RichText data={study.approach} enableGutter={false} />
            </div>
          </section>
        )}
      </div>

      {Array.isArray(study.gallery) && study.gallery.length > 0 && (
        <section className="container grid gap-6 pb-20 md:grid-cols-2" data-reveal-group="100">
          {study.gallery.map((media, i) =>
            media ? (
              <div key={i} data-reveal="up" className="overflow-hidden rounded-3xl border border-border">
                <Media resource={media} imgClassName="w-full object-cover" />
              </div>
            ) : null,
          )}
        </section>
      )}

      <section className="container pb-24 text-center">
        <Link
          href="/case-studies"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to all case studies
        </Link>
      </section>
    </article>
  )
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const study = await queryCaseStudyBySlug({ slug })
  return generateMeta({ doc: study })
}

const queryCaseStudyBySlug = cache(async ({ slug }: { slug: string }) =>
  safely(() => getCaseStudyBySlug(slug), null),
)
