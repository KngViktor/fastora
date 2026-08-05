import { sendGAEvent } from '@next/third-parties/google'

/**
 * Google Analytics 4 helpers.
 *
 * Nothing here does anything until NEXT_PUBLIC_GA_MEASUREMENT_ID is set to a real
 * ID, so the whole feature ships dormant and switches on with an environment
 * variable rather than a deploy of new code.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

/** The placeholder from .env.example, so a copied-but-unedited value stays off. */
const PLACEHOLDER_ID = 'G-XXXXXXXXXX'

/**
 * Whether analytics should run at all.
 *
 * Off in development, because local page views are noise in a report someone
 * makes decisions from. Off without a real measurement ID, so an unconfigured or
 * half-configured deploy cannot start sending data somewhere unintended.
 *
 * This is separate from consent: this answers "is analytics configured", consent
 * answers "may we use it". Both must be true before anything loads.
 */
export const isAnalyticsEnabled = (): boolean =>
  process.env.NODE_ENV !== 'development' &&
  GA_MEASUREMENT_ID !== '' &&
  GA_MEASUREMENT_ID !== PLACEHOLDER_ID

declare global {
  // `dataLayer` is already declared by @next/third-parties; only the gtag shim
  // that the layout's inline Consent Mode script defines needs adding.
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Whether a GA tag has actually loaded.
 *
 * `sendGAEvent` logs a console warning when the dataLayer is missing, which is
 * exactly the state of every visitor who declined analytics. Checking first keeps
 * their console clean instead of warning once per tracked interaction.
 */
const hasDataLayer = (): boolean => typeof window !== 'undefined' && Array.isArray(window.dataLayer)

/**
 * The shape the App Router's `useReportWebVitals` actually passes.
 *
 * Note there is no `label`. That property belongs to the Pages Router's
 * `NextWebVitalsMetric`; in the App Router the hook subscribes straight to the
 * web-vitals library, so the metric is that library's own object. TypeScript will
 * not catch a mistake here — Next ships no type definitions for its bundled copy
 * of web-vitals, so the callback parameter widens to `any`.
 */
export interface WebVitalsMetric {
  id: string
  name: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  delta?: number
}

/**
 * The six metrics the hook subscribes to. Named explicitly so that if a future
 * Next version starts reporting its own hydration or route-change timings through
 * the same callback, those cannot silently pollute the LCP/INP/CLS distributions.
 */
const WEB_VITAL_NAMES = new Set(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB'])

export interface GAEvent {
  action: string
  category?: string
  label?: string
  value?: number
  params?: Record<string, unknown>
}

/**
 * Sends Core Web Vitals to GA4.
 *
 * CLS is multiplied by 1000 because it is a ratio well under 1, and GA4 rounds
 * event values to integers — sent raw, every CLS reading would arrive as 0.
 */
export function reportWebVitals(metric: WebVitalsMetric): void {
  if (!isAnalyticsEnabled() || !hasDataLayer()) return
  if (!WEB_VITAL_NAMES.has(metric.name)) return

  sendGAEvent('event', 'web_vitals', {
    event_category: 'Web Vitals',
    event_label: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
    metric_rating: metric.rating,
    metric_delta: metric.delta,
  })
}

export function trackEvent(event: GAEvent): void {
  if (!isAnalyticsEnabled() || !hasDataLayer()) return

  sendGAEvent('event', event.action, {
    event_category: event.category || 'engagement',
    event_label: event.label,
    value: event.value,
    ...(event.params ?? {}),
  })
}

/**
 * The handful of interactions worth measuring on this site.
 *
 * Deliberately short. A long list of trackers that nobody reads is worse than
 * none: it clutters the reports and invites tracking for its own sake. These map
 * to the questions actually worth answering — are enquiries being sent, is the
 * consultation page working, do people click through to the socials.
 */
export const analytics = {
  /** Which form, and whether it went through. */
  formSubmission: (formName: string, success = true) =>
    trackEvent({
      action: 'form_submission',
      label: formName,
      value: success ? 1 : 0,
      params: { form_name: formName, submission_success: success },
    }),

  /** A consultation request, with the service it came from where there is one. */
  consultationRequest: (serviceTitle?: string) =>
    trackEvent({
      action: 'consultation_request',
      label: serviceTitle || 'general',
      params: { service: serviceTitle || null },
    }),

  externalLink: (url: string, text?: string) =>
    trackEvent({
      action: 'click_external_link',
      label: url,
      params: { link_url: url, link_text: text },
    }),
}
