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
  /** Which built-in brand asset to fall back to before a logo is uploaded in /admin:
   *  "light" = full color logo + wordmark (for light backgrounds),
   *  "dark" = white icon only (for dark backgrounds, e.g. the footer). */
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

  // Real cropped-asset dimensions (402x440), used only so Next/Image can
  // compute the correct intrinsic aspect ratio — actual display size is
  // controlled by the "h-12 w-auto" className below.
  const fallbackSrc = variant === 'dark' ? '/brand/icon-white.png' : '/brand/logo-color.png'

  return (
    <Image
      src={fallbackSrc}
      alt={siteName || 'Fastora'}
      width={402}
      height={440}
      priority={priority === 'high'}
      loading={priority === 'high' ? undefined : loading}
      className={clsx('h-12 w-auto object-contain', className)}
    />
  )
}
