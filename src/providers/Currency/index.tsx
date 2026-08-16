'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
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
  const [code, setCode] = useState<string>(() =>
    isSupportedCurrency(initialCurrency) ? initialCurrency : DEFAULT_CURRENCY,
  )

  // Read after mount rather than during the first render: the server has no
  // cookie to read from on a prerendered page, so resolving it synchronously
  // would make the client's first render disagree with the HTML it hydrates.
  // Nothing renders a price today, so there is nothing to flash; when something
  // does, it settles on the visitor's currency immediately after mount.
  useEffect(() => {
    if (isSupportedCurrency(initialCurrency)) return

    const match = document.cookie.match(
      new RegExp('(?:^|; )' + CURRENCY_COOKIE + '=([^;]*)'),
    )
    const fromCookie = match ? decodeURIComponent(match[1]) : undefined

    if (isSupportedCurrency(fromCookie)) {
      setCode(fromCookie)
    }
  }, [initialCurrency])

  const setCurrency = useCallback((next: string) => {
    if (!isSupportedCurrency(next)) return
    setCode(next)
    // Persist for a year; the proxy reads this cookie and lets it win over
    // geo detection on subsequent requests.
    document.cookie = `${CURRENCY_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`
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
