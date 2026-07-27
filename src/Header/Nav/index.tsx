'use client'

import React, { useEffect, useState } from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = data?.navItems || []
  const [open, setOpen] = useState(false)

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <nav className="flex items-center gap-6">
      {/* Desktop nav */}
      <ul className="hidden items-center gap-6 md:flex">
        {navItems.map(({ link }, i) => (
          <li key={i}>
            <CMSLink
              {...link}
              appearance="inline"
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            />
          </li>
        ))}
      </ul>

      <CMSLink
        type="custom"
        url="/contact"
        label="Book a Consultation"
        appearance="default"
        className="hidden rounded-full bg-secondary px-5 py-2.5 text-sm font-medium text-secondary-foreground transition-opacity hover:opacity-90 sm:inline-flex"
      />

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-muted md:hidden"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Mobile menu panel — anchored directly under the sticky header */}
      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 border-b border-border bg-background/95 shadow-xl backdrop-blur-xl md:hidden"
        >
          <ul className="container-page flex flex-col gap-1 py-4">
            {navItems.map(({ link }, i) => (
              <li key={i}>
                <CMSLink
                  {...link}
                  appearance="inline"
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-base font-medium text-foreground/90 transition-colors hover:bg-muted"
                />
              </li>
            ))}
            <li className="mt-2 px-1">
              <CMSLink
                type="custom"
                url="/contact"
                label="Book a Consultation"
                appearance="default"
                onClick={() => setOpen(false)}
                className="block w-full rounded-full bg-secondary px-5 py-3 text-center text-sm font-semibold text-secondary-foreground"
              />
            </li>
          </ul>
        </div>
      )}
    </nav>
  )
}
