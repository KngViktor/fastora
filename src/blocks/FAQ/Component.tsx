import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

export const FAQBlockComponent: React.FC<FAQBlockProps> = ({ eyebrow, heading, items }) => {
  if (!items?.length) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <section className="container py-20 md:py-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-2xl text-center">
        {eyebrow && (
          <p className="text-sm font-medium uppercase tracking-wide text-secondary">{eyebrow}</p>
        )}
        {heading && <h2 className="mt-2 text-3xl font-semibold md:text-4xl">{heading}</h2>}
      </div>

      <div className="mx-auto mt-10 max-w-3xl divide-y divide-border border-t border-border">
        {items.map((item, i) => (
          <details key={i} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {item.question}
              <span className="shrink-0 text-secondary transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
