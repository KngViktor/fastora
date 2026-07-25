'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

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
