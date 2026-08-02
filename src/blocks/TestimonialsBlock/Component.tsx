import React from 'react'

import { getTestimonials } from '@/lib/api'
import type { Testimonial } from '@/components/ui/testimonial-v2'
import { ScrollingTestimonials } from '@/components/ui/testimonial-v2'

type Props = {
  eyebrow?: string | null
  heading?: string | null
  limit?: number | null
}

export const TestimonialsBlockComponent: React.FC<Props> = async ({ eyebrow, heading, limit }) => {
  const docs = await getTestimonials({ showOnHome: true, limit: limit || 3 })

  if (!docs?.length) return null

  const testimonials: Testimonial[] = docs.map((testimonial) => ({
    text: testimonial.quote,
    name: testimonial.clientName,
    role: [testimonial.role, testimonial.company].filter(Boolean).join(', '),
    image:
      testimonial.avatar && typeof testimonial.avatar === 'object'
        ? (testimonial.avatar.url ?? undefined)
        : undefined,
  }))

  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-[540px] text-center" data-reveal="up">
        {eyebrow && (
          <span className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
            {eyebrow}
          </span>
        )}
        {heading && <h2 className="mt-3 text-3xl font-semibold md:text-5xl">{heading}</h2>}
      </div>

      <div data-reveal="up">
        <ScrollingTestimonials testimonials={testimonials} />
      </div>
    </section>
  )
}
