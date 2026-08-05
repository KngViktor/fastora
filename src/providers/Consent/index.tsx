'use client'

import React, { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'

export type ConsentState = 'granted' | 'denied' | 'unknown'

const STORAGE_KEY = 'fastora-analytics-consent'

/**
 * The stored choice, treated as the external store it actually is.
 *
 * Read through useSyncExternalStore rather than copied into state by an effect.
 * That gets hydration right for free — React uses the server snapshot ('unknown')
 * for the hydrating render and reconciles against the real value straight after,
 * so the markup never disagrees with itself and no cascading render is needed.
 */
const listeners = new Set<() => void>()

const readConsent = (): ConsentState => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'granted' || saved === 'denied' ? saved : 'unknown'
  } catch {
    // Storage throws in some private-browsing modes. 'unknown' is the safe
    // failure: the banner shows and nothing is tracked.
    return 'unknown'
  }
}

/** Always 'unknown' on the server — there is nothing to read, and no consent yet. */
const serverConsent = (): ConsentState => 'unknown'

const subscribe = (onStoreChange: () => void): (() => void) => {
  listeners.add(onStoreChange)
  // 'storage' only fires in *other* tabs, which is exactly what is wanted: a
  // choice made in one tab takes effect in the ones already open.
  window.addEventListener('storage', onStoreChange)

  return () => {
    listeners.delete(onStoreChange)
    window.removeEventListener('storage', onStoreChange)
  }
}

const writeConsent = (next: ConsentState): void => {
  try {
    if (next === 'unknown') window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // A visitor who cannot persist the choice still has it honoured for this page
    // load; they will simply be asked again next time.
  }

  // localStorage fires no event in the tab that wrote it, so notify by hand.
  listeners.forEach((listener) => listener())
}

type ConsentContextValue = {
  consent: ConsentState
  setConsent: (next: Exclude<ConsentState, 'unknown'>) => void
  /** Reopens the banner, for a "cookie settings" link. */
  resetConsent: () => void
}

const ConsentContext = createContext<ConsentContextValue>({
  consent: 'unknown',
  setConsent: () => {},
  resetConsent: () => {},
})

export const useConsent = () => useContext(ConsentContext)

/**
 * Holds whether the visitor has agreed to analytics.
 *
 * This is the layer that actually enforces "reject means no data": the Analytics
 * component returns null while consent is anything but 'granted', so the GA script
 * is never injected and no request to Google is made. Consent Mode (the inline
 * default in the layout) is the second line of defence, for the case where a tag
 * loads anyway.
 */
export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const consent = useSyncExternalStore(subscribe, readConsent, serverConsent)

  /**
   * Mirrors the decision into Consent Mode.
   *
   * Keyed on `consent` rather than fired from the click handler, because the state
   * also arrives by being restored from storage on a repeat visit. Doing it only on
   * click would leave a returning visitor who accepted last week with the tag
   * loaded but analytics_storage still at its denied default, so GA would collect
   * in degraded cookieless mode and their sessions would never stitch together.
   *
   * `gtag` here is the shim defined by the inline default script in the document
   * head, so this queues into the dataLayer correctly even before gtag.js has
   * loaded — Consent Mode replays the queue in order once it does.
   */
  useEffect(() => {
    if (consent === 'unknown') return

    window.gtag?.('consent', 'update', {
      analytics_storage: consent === 'granted' ? 'granted' : 'denied',
    })
  }, [consent])

  const setConsent = useCallback((next: Exclude<ConsentState, 'unknown'>) => {
    writeConsent(next)
  }, [])

  const resetConsent = useCallback(() => {
    writeConsent('unknown')
  }, [])

  return (
    <ConsentContext.Provider value={{ consent, setConsent, resetConsent }}>
      {children}
    </ConsentContext.Provider>
  )
}
