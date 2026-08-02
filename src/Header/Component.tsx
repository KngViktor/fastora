import { HeaderClient } from './Component.client'
import { DEFAULT_NAV, DEFAULT_SITE_SETTINGS, getHeader, getSiteSettings, safely } from '@/lib/api'
import React from 'react'

export async function Header() {
  const headerData = await safely(() => getHeader(), DEFAULT_NAV)
  const siteSettings = await safely(() => getSiteSettings(), DEFAULT_SITE_SETTINGS)

  return <HeaderClient data={headerData} siteSettings={siteSettings} />
}
