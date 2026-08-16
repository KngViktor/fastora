'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react'

import type { Currency } from '@/config/currencies'
import {
  convertFromBase,
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  formatPrice as formatPriceBase,
  getCurrency,
  isSupportedCurrency,
} from '@/config/currencies'

interface CurrencyContextValue {
  /** Active currency code, e.g. "NGN". */
  code: string
  /** Full active currency descriptor. */
  currency: Currency
  /** Manually switch currency (persists in a cookie, honored by the proxy). */
  setCurrency: (code: string) => void
  /** Format a BASE-currency amount in the active currency. */
  format: (baseAmount: number, fractionDigits?: number) => string
  /** Convert a BASE-currency amount into the active currency (number). */
  convert: (baseAmount: number) => number
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

/**
 * The cookie, exposed as an external store.
 *
 * The currency has to be read on the client: the pages are prerendered, so
 * there is no request to resolve it from at build time. Reading it in an effect
 * and calling setState would work, but it schedules a second render on every
 * mount for a value that is almost always the default. useSyncExternalStore is
 * built for exactly this — a client-only value with a separate server snapshot
 * — and React handles the hydration difference itself.
 */
const listeners = new Set<() => void>()

/** Cached so getSnapshot returns a stable value; React calls it on every render. */
let snapshot: string | null = null

function readCurrencyCookie(): string {
  const match = document.cookie.match(new RegExp('(?:^|; )' + CURRENCY_COOKIE + '=([^;]*)'))
  const value = match ? decodeURIComponent(match[1]) : undefined

  return isSupportedCurrency(value) ? value : DEFAULT_CURRENCY
}

function getSnapshot(): string {
  if (snapshot === null) {
    snapshot = readCurrencyCookie()
  }

  return snapshot
}

/** Prerendered HTML has no cookie, so it always renders the default. */
function getServerSnapshot(): string {
  return DEFAULT_CURRENCY
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

function writeCurrencyCookie(next: string): void {
  // Persist for a year; the proxy reads this cookie and lets it win over geo
  // detection on subsequent requests.
  document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
  snapshot = next
  listeners.forEach((listener) => listener())
}

/**
 * `initialCurrency` is optional and normally omitted.
 *
 * The layout used to resolve it from the request, which meant calling headers()
 * and cookies() there — and that opts every page in the app out of static
 * rendering, so each visitor waited on a fresh server render (and on the API
 * behind it) for a currency the site does not currently display anywhere.
 * Resolving it here instead lets those pages be prerendered and served from
 * cache.
 *
 * Kept as a prop so a route that genuinely renders a price server-side can pass
 * the value in and accept the dynamic rendering that comes with it.
 */
export function CurrencyProvider({
  initialCurrency,
  children,
}: {
  initialCurrency?: string
  children: React.ReactNode
}) {
  const fromCookie = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  // A server-resolved value, where a route passes one, outranks the cookie.
  const code = isSupportedCurrency(initialCurrency) ? initialCurrency : fromCookie

  const setCurrency = useCallback((next: string) => {
    if (!isSupportedCurrency(next)) return
    writeCurrencyCookie(next)
  }, [])

  const value = useMemo<CurrencyContextValue>(
    () => ({
      code,
      currency: getCurrency(code),
      setCurrency,
      format: (baseAmount, fractionDigits) => formatPriceBase(baseAmount, code, fractionDigits),
      convert: (baseAmount) => convertFromBase(baseAmount, code),
    }),
    [code, setCurrency],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return ctx
}
