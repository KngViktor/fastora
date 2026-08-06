import React from 'react'

import { CMSLink } from '@/components/Link'

export default function NotFound() {
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
      <h1 className="text-3xl font-semibold md:text-5xl">We couldn&apos;t find that page.</h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        The page you&apos;re looking for may have been moved, renamed, or no longer exists.
        Let&apos;s help you find your way back.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <CMSLink label="Go to Homepage" url="/" appearance="default" />
        <CMSLink label="Explore Services" url="/services" appearance="outline" />
      </div>
    </div>
  )
}
