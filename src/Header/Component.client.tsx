'use client'
import Link from 'next/link'
import React from 'react'

import type { Nav, SiteSettings } from '@/lib/api'

import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'

interface HeaderClientProps {
  data: Nav
  siteSettings: SiteSettings
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, siteSettings }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="container-page flex items-center justify-between py-5">
        <Link href="/" className="shrink-0">
          <Logo
            loading="eager"
            priority="high"
            media={siteSettings?.logoLight}
            siteName={siteSettings?.siteName}
            variant="light"
          />
        </Link>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
