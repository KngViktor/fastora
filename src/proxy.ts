import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
  CURRENCY_COOKIE,
  CURRENCY_HEADER,
  currencyForCountry,
  isSupportedCurrency,
} from '@/config/currencies'

/**
 * Next 16 Proxy (formerly `middleware`). Runs before every matched request and
 * resolves the display currency:
 *
 *   1. If the visitor has manually chosen a currency (cookie), that wins.
 *   2. Otherwise map their country (from the host's geo-IP header) to a currency.
 *
 * The result is forwarded to the app via the `x-fastora-currency` request
 * header so the layout can render the correct currency on the first paint
 * (no client-side flash). See src/config/currencies.ts.
 */
export function proxy(request: NextRequest) {
  // Geo-IP country header, set by the hosting platform.
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') || // Cloudflare
    request.headers.get('x-country') ||
    null

  const manualChoice = request.cookies.get(CURRENCY_COOKIE)?.value
  const currency = isSupportedCurrency(manualChoice)
    ? manualChoice
    : currencyForCountry(country)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(CURRENCY_HEADER, currency)

  return NextResponse.next({ request: { headers: requestHeaders } })
}

export const config = {
  // Run on page requests only — skip API routes, the Payload admin, Next
  // internals, and static assets so we never touch CSS/JS/image delivery.
  matcher: [
    '/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}
