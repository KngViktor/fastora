import Link from 'next/link'
import React from 'react'
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaThreads,
  FaTiktok,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6'

import { DEFAULT_NAV, DEFAULT_SITE_SETTINGS, getFooter, getSiteSettings, safely } from '@/lib/api'
import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { NewsletterForm } from '@/components/NewsletterForm'

const socialLabels: Record<string, string> = {
  instagram: 'Instagram',
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  threads: 'Threads',
  whatsapp: 'WhatsApp',
}

const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: FaInstagram,
  twitter: FaXTwitter,
  linkedin: FaLinkedin,
  tiktok: FaTiktok,
  youtube: FaYoutube,
  facebook: FaFacebook,
  threads: FaThreads,
  whatsapp: FaWhatsapp,
}

export async function Footer() {
  const footerData = await safely(() => getFooter(), DEFAULT_NAV)
  const siteSettings = await safely(() => getSiteSettings(), DEFAULT_SITE_SETTINGS)

  const navItems = footerData?.navItems || []
  const socialLinks = siteSettings?.socialLinks || []

  return (
    <footer className="mt-auto bg-primary text-primary-foreground">
      <div className="container-page grid grid-cols-1 gap-12 py-16 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-4">
          <Link href="/" className="inline-block">
            <Logo media={siteSettings?.logoDark} siteName={siteSettings?.siteName} variant="dark" />
          </Link>
          <p className="max-w-xs text-sm text-primary-foreground/70">{siteSettings?.tagline}</p>
          {socialLinks.length > 0 && (
            <ul className="flex flex-wrap items-center gap-3 pt-2">
              {socialLinks.map((social, i) => {
                const Icon = socialIcons[social.platform]
                const label = socialLabels[social.platform] || social.platform

                return (
                  <li key={i}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-primary-foreground/70 transition-colors hover:text-primary-foreground"
                    >
                      {Icon ? (
                        <Icon className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
                      ) : (
                        <span className="text-xs">{label}</span>
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-primary-foreground/50">Navigate</p>
          <nav className="mt-4 flex flex-col gap-3">
            {navItems.map((item, i) => (
              <CMSLink
                key={i}
                label={item.label}
                url={item.url}
                appearance="inline"
                className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              />
            ))}
          </nav>
          {(siteSettings?.contactEmail || siteSettings?.contactPhone) && (
            <div className="mt-6 space-y-1 text-sm text-primary-foreground/80">
              {siteSettings?.contactEmail && (
                <a href={`mailto:${siteSettings.contactEmail}`} className="block hover:text-primary-foreground">
                  {siteSettings.contactEmail}
                </a>
              )}
              {siteSettings?.contactPhone && (
                <a href={`tel:${siteSettings.contactPhone}`} className="block hover:text-primary-foreground">
                  {siteSettings.contactPhone}
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-primary-foreground/50">
            {siteSettings?.newsletterHeading}
          </p>
          <p className="mt-2 text-sm text-primary-foreground/70">
            {siteSettings?.newsletterSubheading}
          </p>
          <NewsletterForm source="footer" />
        </div>
      </div>

      <div
        className="select-none overflow-hidden border-t border-primary-foreground/10 pt-6"
        aria-hidden="true"
      >
        <span className="block bg-gradient-to-b from-primary-foreground/20 to-primary-foreground/[0.03] bg-clip-text text-center text-[22vw] font-bold leading-none tracking-tighter text-transparent">
          {siteSettings?.siteName || 'Fastora'}
        </span>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-primary-foreground/60 md:flex-row md:items-center md:justify-between">
          <p>{siteSettings?.footerText}</p>
        </div>
      </div>
    </footer>
  )
}
