import { NextResponse } from 'next/server'

import { submitNewsletter } from '@/lib/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Public newsletter signup endpoint. Proxies to the Laravel API, which
 * stores the subscriber and forwards to whichever provider is connected in
 * Site Settings → Newsletter (see NewsletterService on the backend). A
 * hidden honeypot field (`website`) silently absorbs bots on both sides,
 * matching /api/contact.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const website = typeof body.website === 'string' ? body.website : undefined

  if (!website) {
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
  }

  const source = typeof body.source === 'string' ? body.source : undefined

  const result = await submitNewsletter({ email: email.slice(0, 254), source, website })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  return NextResponse.json({ success: true })
}
