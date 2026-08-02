import type { Metadata } from 'next'
import { Poppins, Inter, Geist_Mono } from 'next/font/google'
import React from 'react'
import { cookies, draftMode, headers } from 'next/headers'

import { cn } from '@/utilities/ui'
import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { ScrollReveal } from '@/components/ScrollReveal'
import { CurrencyProvider } from '@/providers/Currency'
import { CURRENCY_COOKIE, CURRENCY_HEADER, DEFAULT_CURRENCY } from '@/config/currencies'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { DEFAULT_SITE_SETTINGS, getSiteSettings, safely } from '@/lib/api'
import { buildBrandStyle } from '@/utilities/brandTokens'

import './globals.css'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  const siteSettings = await safely(() => getSiteSettings(), DEFAULT_SITE_SETTINGS)
  const brandStyle = buildBrandStyle(siteSettings.colors)
  const url = getServerSideURL()

  // Currency resolved by the proxy (geo or manual choice), forwarded via header;
  // fall back to the cookie, then the default, so the first paint is correct.
  const [headerList, cookieStore] = await Promise.all([headers(), cookies()])
  const initialCurrency =
    headerList.get(CURRENCY_HEADER) ||
    cookieStore.get(CURRENCY_COOKIE)?.value ||
    DEFAULT_CURRENCY

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${url}/#organization`,
    name: siteSettings?.siteName || 'Fastora',
    description: siteSettings?.tagline,
    url,
    ...(siteSettings?.contactEmail ? { email: siteSettings.contactEmail } : {}),
    ...(siteSettings?.contactPhone ? { telephone: siteSettings.contactPhone } : {}),
    ...(siteSettings?.address ? { address: siteSettings.address } : {}),
    sameAs: (siteSettings?.socialLinks || []).map((social) => social.url).filter(Boolean),
  }

  return (
    <html
      className={cn(poppins.variable, inter.variable, geistMono.variable, 'h-full')}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <link href="/favicon.png" rel="icon" type="image/png" sizes="32x32" />
        <link href="/favicon.png" rel="apple-touch-icon" />
        {brandStyle && <style id="fastora-brand-tokens">{brandStyle}</style>}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;clip-path:none !important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <CurrencyProvider initialCurrency={initialCurrency}>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ScrollReveal />
        </CurrencyProvider>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    default: 'Fastora, Communications & Digital Strategy',
    template: '%s | Fastora',
  },
  description:
    'Fastora is a communications and digital strategy company that helps businesses communicate with purpose, strengthen their brands, and earn the attention they deserve.',
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
