/**
 * Geo-aware currency configuration.
 *
 * A visitor's country (detected in `proxy.ts`) is mapped to a display currency
 * here, and prices authored in the BASE currency are converted + formatted for
 * that currency. Everything the feature needs lives in this one file so rates
 * and supported currencies can be updated without touching component code.
 *
 * NOTE: `rate` values are indicative placeholders (units per 1 BASE unit).
 * Update them here, or wire them to a live FX source, before showing real
 * prices. The base currency is the unit prices are authored in.
 */

export interface Currency {
  /** ISO 4217 code, e.g. "NGN". */
  code: string
  /** Display symbol, e.g. "₦". */
  symbol: string
  /** Human-readable name. */
  name: string
  /** BCP-47 locale used for Intl number formatting. */
  locale: string
  /** Units of this currency per 1 unit of the BASE currency. */
  rate: number
}

/** Cookie holding a visitor's manual currency choice (wins over geo detection). */
export const CURRENCY_COOKIE = 'fastora-currency'

/** Request header the proxy uses to forward the resolved currency to the app. */
export const CURRENCY_HEADER = 'x-fastora-currency'

/** Prices across the site are authored in this currency. */
export const BASE_CURRENCY = 'USD'

/** Shown when a country can't be detected or isn't mapped. */
export const DEFAULT_CURRENCY = 'USD'

export const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', rate: 1 },
  NGN: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', locale: 'en-NG', rate: 1600 },
  ZAR: { code: 'ZAR', symbol: 'R', name: 'South African Rand', locale: 'en-ZA', rate: 18 },
  GHS: { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi', locale: 'en-GH', rate: 15 },
  KES: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', locale: 'en-KE', rate: 130 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', rate: 0.79 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE', rate: 0.92 },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA', rate: 1.36 },
}

/** The currencies offered in the manual switcher, in display order. */
export const SWITCHABLE_CURRENCIES = ['USD', 'NGN', 'ZAR', 'GHS', 'KES', 'GBP', 'EUR', 'CAD']

/**
 * ISO 3166-1 alpha-2 country code → currency code.
 * Countries not listed fall back to DEFAULT_CURRENCY.
 */
export const COUNTRY_CURRENCY: Record<string, string> = {
  NG: 'NGN',
  ZA: 'ZAR',
  GH: 'GHS',
  KE: 'KES',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  // Euro-area
  IE: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  PT: 'EUR',
  AT: 'EUR',
  FI: 'EUR',
}

export function isSupportedCurrency(code?: string | null): code is string {
  return Boolean(code && Object.prototype.hasOwnProperty.call(CURRENCIES, code))
}

export function getCurrency(code?: string | null): Currency {
  return isSupportedCurrency(code) ? CURRENCIES[code] : CURRENCIES[DEFAULT_CURRENCY]
}

/** Resolve a currency code from an ISO country code. */
export function currencyForCountry(country?: string | null): string {
  if (!country) return DEFAULT_CURRENCY
  return COUNTRY_CURRENCY[country.toUpperCase()] || DEFAULT_CURRENCY
}

/** Convert an amount expressed in the BASE currency into `code`. */
export function convertFromBase(baseAmount: number, code?: string | null): number {
  return baseAmount * getCurrency(code).rate
}

/**
 * Format a BASE-currency amount for display in `code`.
 * Decimals default to none (marketing prices); pass `fractionDigits` to override.
 */
export function formatPrice(
  baseAmount: number,
  code?: string | null,
  fractionDigits = 0,
): string {
  const currency = getCurrency(code)
  const converted = convertFromBase(baseAmount, currency.code)

  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: 0,
    }).format(converted)
  } catch {
    // Fallback if a locale/currency isn't supported by the runtime's ICU data.
    const rounded = converted.toFixed(fractionDigits)
    return `${currency.symbol}${Number(rounded).toLocaleString()}`
  }
}
