import React from 'react'

import { getTestimonials, safely } from '@/lib/api'
import type { Testimonial } from '@/components/ui/testimonial-v2'
import { ScrollingTestimonials } from '@/components/ui/testimonial-v2'

type Props = {
  heading?: string | null
  limit?: number | null
}

export const TestimonialsBlockComponent: React.FC<Props> = async ({ heading, limit }) => {
  const docs = await safely(() => getTestimonials({ showOnHome: true, limit: limit || 3 }), [])

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
      {heading && (
        <div className="mx-auto max-w-[540px] text-center" data-reveal="up">
          <h2 className="text-3xl font-semibold md:text-5xl">{heading}</h2>
        </div>
      )}

      <div data-reveal="up">
        <ScrollingTestimonials testimonials={testimonials} />
      </div>
    </section>
  )
}
