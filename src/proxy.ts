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
 * The result is written to the cookie rather than only forwarded as a request
 * header. The layout used to read that header, but doing so meant calling
 * headers() there, which opts every page out of static rendering — every
 * visitor then waited on a fresh server render, and on the API behind it, for a
 * currency nothing on the site displays. The cookie reaches the client
 * directly, so geo detection still works and the pages can be prerendered.
 *
 * The header is still forwarded for any route that does want to render a price
 * on the server and is willing to be dynamic to do it.
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

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // Only when it is not already the stored value, so a visitor's own choice is
  // never overwritten and repeat requests do not keep rewriting the same cookie.
  if (manualChoice !== currency) {
    response.cookies.set(CURRENCY_COOKIE, currency, {
      path: '/',
      maxAge: 31536000,
      sameSite: 'lax',
    })
  }

  return response
}

export const config = {
  // Run on page requests only — skip API routes, the Payload admin, Next
  // internals, and static assets so we never touch CSS/JS/image delivery.
  matcher: [
    '/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}
