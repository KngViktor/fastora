import clsx from 'clsx'
import Image from 'next/image'
import React from 'react'

import type { Media as MediaType } from '@/lib/api'

import { Media } from '@/components/Media'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  media?: MediaType | number | null
  siteName?: string | null
  /** Which built-in brand asset to fall back to before a logo is uploaded in
   *  /admin: "light" = blue icon (for light backgrounds), "dark" = white icon
   *  (for dark backgrounds, e.g. the footer). Both are the mark alone. */
  variant?: 'light' | 'dark'
}

export const Logo: React.FC<Props> = ({
  className,
  loading = 'lazy',
  priority = 'low',
  media,
  siteName,
  variant = 'light',
}) => {
  if (media && typeof media === 'object') {
    return (
      <Media
        resource={media}
        htmlElement={null}
        imgClassName={clsx('h-12 w-auto object-contain', className)}
        loading={loading}
        priority={priority === 'high'}
      />
    )
  }

  // The mark alone, without the wordmark. icon-color.png is cropped from
  // logo-color.png so the light-background version keeps the brand blue — the
  // pre-existing icon-only files are charcoal and white only.
  //
  // Dimensions are the real asset size (355x300), given only so Next/Image can
  // work out the intrinsic aspect ratio; display size comes from the h-12 below.
  const fallbackSrc = variant === 'dark' ? '/brand/icon-white.png' : '/brand/icon-color.png'

  return (
    <Image
      src={fallbackSrc}
      alt={siteName || 'Fastora'}
      width={355}
      height={300}
      priority={priority === 'high'}
      loading={priority === 'high' ? undefined : loading}
      className={clsx('h-12 w-auto object-contain', className)}
    />
  )
}
