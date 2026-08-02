import { HeaderClient } from './Component.client'
import { getHeader, getSiteSettings } from '@/lib/api'
import React from 'react'

export async function Header() {
  const headerData = await getHeader()
  const siteSettings = await getSiteSettings()

  return <HeaderClient data={headerData} siteSettings={siteSettings} />
}
