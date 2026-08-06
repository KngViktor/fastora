'use client'

import Link from 'next/link'
import React from 'react'

import { isAnalyticsEnabled } from '@/lib/analytics'
import { useConsent } from '@/providers/Consent'

/**
 * Asks once whether analytics may run.
 *
 * Only appears when analytics is actually configured and no choice has been made.
 * A banner on a site with no analytics would be theatre — asking permission for
 * something that was never going to happen.
 *
 * Both buttons are given equal visual weight on purpose. Making "Reject" quieter
 * than "Accept" is the pattern regulators have been fining, and it is dishonest
 * design regardless.
 */
export const CookieConsent: React.FC = () => {
  const { consent, setConsent } = useConsent()

  if (!isAnalyticsEnabled() || consent !== 'unknown') return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Analytics cookies"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-card p-5 shadow-lg sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <p className="text-sm text-muted-foreground">
        We&apos;d like to use analytics cookies to understand how the site is used. They stay off
        unless you accept, and we don&apos;t use them for advertising.{' '}
        <Link href="/privacy-policy" className="underline hover:text-secondary">
          Learn more
        </Link>
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setConsent('granted')}
          className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
        >
          Accept
        </button>
        <button
          type="button"
          onClick={() => setConsent('denied')}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-secondary hover:text-secondary"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
