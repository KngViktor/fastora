import { NextResponse } from 'next/server'
import { Resend } from 'resend'

import { submitContact } from '@/lib/api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Public contact endpoint. Proxies to the Laravel API's /api/contact, which
 * does the real validation and Inquiry creation — this route stays a thin
 * pass-through so the client-side form's fetch target (`/api/contact`) never
 * has to change, and adds a best-effort admin notification email on success.
 * A hidden honeypot field (`website`) silently absorbs bots on both sides.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const brief = typeof body.brief === 'string' ? body.brief.trim() : ''

  if (typeof body.website !== 'string' || body.website.trim() === '') {
    if (!name || !email || !brief) {
      return NextResponse.json(
        { error: 'Name, email, and a project brief are required.' },
        { status: 400 },
      )
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
  }

  const company = typeof body.company === 'string' ? body.company.trim() : undefined
  const budgetRange = typeof body.budgetRange === 'string' ? body.budgetRange : undefined
  const timeline = typeof body.timeline === 'string' ? body.timeline : undefined
  const serviceNeededRaw = body.serviceNeeded
  const serviceNeeded =
    serviceNeededRaw !== undefined && serviceNeededRaw !== null && serviceNeededRaw !== ''
      ? Number(serviceNeededRaw)
      : undefined

  const result = await submitContact({
    name,
    email,
    brief,
    company,
    budgetRange,
    timeline,
    serviceNeeded: serviceNeeded && !Number.isNaN(serviceNeeded) ? serviceNeeded : undefined,
    website: typeof body.website === 'string' ? body.website : undefined,
  })

  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 422 })
  }

  // Best-effort admin notification — a failed email must never block the
  // submission itself, since it's already safely saved in the CMS.
  if (process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFICATION_EMAIL) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Fastora <onboarding@resend.dev>',
        to: process.env.ADMIN_NOTIFICATION_EMAIL,
        replyTo: email,
        subject: `New inquiry from ${name}${company ? ` (${company})` : ''}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          company ? `Company: ${company}` : null,
          budgetRange ? `Budget: ${budgetRange}` : null,
          timeline ? `Timeline: ${timeline}` : null,
          '',
          'Brief:',
          brief,
        ]
          .filter(Boolean)
          .join('\n'),
      })
    } catch (emailError) {
      console.error('Failed to send inquiry notification email:', emailError)
    }
  }

  return NextResponse.json({ success: true })
}
