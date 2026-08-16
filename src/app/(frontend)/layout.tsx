import type { Metadata } from 'next'
import { Poppins, Inter, Geist_Mono } from 'next/font/google'
import React from 'react'

import { cn } from '@/utilities/ui'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { ScrollReveal } from '@/components/ScrollReveal'
import { Analytics } from '@/components/Analytics'
import { CookieConsent } from '@/components/CookieConsent'
import { ConsentProvider } from '@/providers/Consent'
import { CurrencyProvider } from '@/providers/Currency'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { getServerSideURL } from '@/utilities/getURL'
import { DEFAULT_SITE_SETTINGS, getSiteSettings, safely } from '@/lib/api'
import { buildBrandStyle } from '@/utilities/brandTokens'
import { isAnalyticsEnabled } from '@/lib/analytics'

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
  const siteSettings = await safely(() => getSiteSettings(), DEFAULT_SITE_SETTINGS)
  const brandStyle = buildBrandStyle(siteSettings.colors)
  const url = getServerSideURL()

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
    ...(siteSettings?.logoLight?.url ? { logo: siteSettings.logoLight.url } : {}),
  }

  /**
   * WebSite, bundled with the organisation in a single @graph rather than a
   * second script tag. `publisher` pointing at the organisation's @id is what
   * tells Google the two describe one entity rather than two unrelated ones.
   *
   * No SearchAction: that property is what enables the sitelinks search box, and
   * Google only honours it when the site has a working search endpoint. There
   * isn't one here, so claiming it would be a promise the site can't keep.
   */
  const websiteJsonLd = {
    '@type': 'WebSite',
    '@id': `${url}/#website`,
    name: siteSettings?.siteName || 'Fastora',
    description: siteSettings?.tagline,
    url,
    inLanguage: 'en',
    publisher: { '@id': `${url}/#organization` },
  }

  // @context lives on the graph, so it is stripped from the member objects.
  const { '@context': _organizationContext, ...organizationNode } = organizationJsonLd

  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [organizationNode, websiteJsonLd],
  }

  /**
   * Google Consent Mode v2 defaults, denied.
   *
   * A plain inline script rather than next/script, because this has to execute
   * before any gtag command and a plain script in the head is the only way to be
   * certain of that. It also defines the `gtag` shim and the dataLayer array, which
   * is what lets the consent provider queue an update from React even though
   * gtag.js has not loaded yet.
   *
   * Denying by default is the point: nothing is stored until the visitor says yes.
   * The GA component not mounting is the primary guarantee — this is the backstop
   * for the case where a tag ends up on the page some other way.
   */
  const consentDefaultScript = `
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
`.trim()

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
        {isAnalyticsEnabled() && (
          <script
            id="fastora-consent-default"
            dangerouslySetInnerHTML={{ __html: consentDefaultScript }}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important;clip-path:none !important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        <ConsentProvider>
          {/* No initialCurrency: resolving it from the request would need
              headers()/cookies() here, which opts every page in the app out of
              static rendering. The provider reads the cookie itself. */}
          <CurrencyProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <ScrollReveal />
          </CurrencyProvider>
          <CookieConsent />
          {/* After the content, so the tag never competes with the page for bandwidth. */}
          <Analytics />
        </ConsentProvider>
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
