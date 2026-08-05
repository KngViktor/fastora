'use client'

import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google'
import { useReportWebVitals } from 'next/web-vitals'
import React from 'react'

import { GA_MEASUREMENT_ID, isAnalyticsEnabled, reportWebVitals } from '@/lib/analytics'
import { useConsent } from '@/providers/Consent'

/**
 * Reports Core Web Vitals.
 *
 * `reportWebVitals` is passed by reference, not wrapped in an inline arrow. The
 * hook re-subscribes whenever the callback's identity changes, so a new function
 * each render would report the same metric repeatedly. That is also why the
 * consent check lives in the parent rather than inside the callback: closing over
 * consent would make the identity unstable again.
 *
 * Mounting only after consent means the first few metrics are collected before
 * this subscribes, which is fine — the web-vitals library replays what it already
 * has to a late subscriber.
 */
const WebVitals: React.FC = () => {
  useReportWebVitals(reportWebVitals)
  return null
}

/**
 * Loads GA4, but only once analytics is both configured and permitted.
 *
 * Returning null is the whole mechanism: while consent is 'unknown' or 'denied'
 * the component renders nothing, so the gtag script is never injected, no request
 * reaches googletagmanager.com, and no cookie is written. That is what makes
 * "Reject" mean no data rather than data collected quietly.
 *
 * Clicking Accept re-renders this and GA mounts for the first time.
 */
export const Analytics: React.FC = () => {
  const { consent } = useConsent()

  if (!isAnalyticsEnabled() || consent !== 'granted') return null

  return (
    <>
      <NextGoogleAnalytics gaId={GA_MEASUREMENT_ID} />
      <WebVitals />
    </>
  )
}
