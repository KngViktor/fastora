'use client'

import { useEffect, useState } from 'react'

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export interface Testimonial {
  text: string
  image?: string
  name: string
  role: string
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

/** Auto-advancing carousel, one card at a time, looping back to the start. */
export const TestimonialsCarousel: React.FC<{ testimonials: Testimonial[] }> = ({
  testimonials,
}) => {
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!api || testimonials.length <= 1) return

    const timeout = setTimeout(() => {
      if (api.selectedScrollSnap() + 1 === api.scrollSnapList().length) {
        setCurrent(0)
        api.scrollTo(0)
      } else {
        api.scrollNext()
        setCurrent(current + 1)
      }
    }, 4000)

    return () => clearTimeout(timeout)
  }, [api, current, testimonials.length])

  if (!testimonials.length) return null

  return (
    <Carousel setApi={setApi} className="w-full">
      <CarouselContent>
        {testimonials.map((testimonial, i) => (
          <CarouselItem className="md:basis-1/2 lg:basis-1/3" key={i}>
            <div className="flex h-full flex-col justify-between gap-6 rounded-3xl border border-border bg-card p-8 shadow-lg shadow-black/20">
              <blockquote className="m-0 p-0">
                <p className="leading-relaxed text-muted-foreground">{testimonial.text}</p>
              </blockquote>
              <footer className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-border">
                  {testimonial.image && <AvatarImage src={testimonial.image} alt="" />}
                  <AvatarFallback>{initials(testimonial.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <cite className="not-italic font-semibold leading-5 tracking-tight text-foreground">
                    {testimonial.name}
                  </cite>
                  <span className="mt-0.5 text-sm leading-5 tracking-tight text-muted-foreground">
                    {testimonial.role}
                  </span>
                </div>
              </footer>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
