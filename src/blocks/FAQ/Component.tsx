import React from 'react'

type Props = {
  heading?: string | null
  items?: { question: string; answer: string }[]
}

export const FAQBlockComponent: React.FC<Props> = ({ heading, items }) => {
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
    <section className="container py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {heading && (
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">{heading}</h2>
        </div>
      )}

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
