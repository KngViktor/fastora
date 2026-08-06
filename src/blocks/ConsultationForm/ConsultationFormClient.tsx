'use client'

import { Check } from 'lucide-react'
import React, { useState } from 'react'

import { analytics } from '@/lib/analytics'

type Props = {
  idealFor: { label: string }[]
  submitLabel: string
  reassurance: string
  /**
   * Set on a service page. The service is then fixed and stated as a heading
   * rather than offered in a picker: someone who has just read the Content
   * Strategy page has already chosen, and a dropdown listing the other nine
   * invites them to reconsider at the exact moment they were ready to act.
   */
  service?: { id: number; title: string } | null
}

const fieldClass =
  'w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-secondary'

/**
 * Consultation request form.
 *
 * Asks for times the visitor can make, in their own words, rather than showing a
 * slot picker. A picker would have to be fed by availability kept current by
 * hand, and this app cannot see the calendar those sessions actually live in — so
 * it would happily offer a slot that is already taken. Free text costs one email
 * to confirm and cannot double-book anybody.
 *
 * Posts to the same endpoint as the contact form with kind: 'consultation', so
 * both land in one inbox with one notification path.
 */
export const ConsultationFormClient: React.FC<Props> = ({
  idealFor,
  submitLabel,
  reassurance,
  service = null,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'consultation',
          name: data.get('name'),
          email: data.get('email'),
          company: data.get('company'),
          brief: data.get('brief'),
          preferredTimes: data.get('preferredTimes'),
          budgetRange: data.get('budgetRange'),
          // Carried from the page rather than chosen in the form.
          serviceNeeded: service?.id ?? null,
          // Read from the browser rather than asked for: one less field, and more
          // reliable than someone guessing their own offset.
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          website: data.get('website'),
        }),
      })

      if (!res.ok) throw new Error('failed')

      setStatus('success')
      analytics.formSubmission('consultation')
      analytics.consultationRequest(service?.title)
      form.reset()
    } catch {
      setError('Something went wrong. Please try again, or email us directly.')
      setStatus('error')
      analytics.formSubmission('consultation', false)
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-3xl border border-secondary/40 bg-secondary/10 p-8">
        <h3 className="text-xl font-semibold">Thanks, your request is in.</h3>
        <p className="mt-2 text-sm text-muted-foreground">{reassurance}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
      {idealFor.length > 0 && (
        <div>
          <p className="text-sm font-medium text-muted-foreground">Ideal for</p>
          <ul className="mt-4 flex flex-col gap-3">
            {idealFor.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {service && (
          <p className="rounded-xl border border-secondary/40 bg-secondary/10 px-4 py-3 text-sm">
            About <span className="font-semibold">{service.title}</span>
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {/* Honeypot — visually hidden, ignored by real users. */}
        <div aria-hidden="true" className="absolute left-[-9999px]">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="cf-name" className="text-sm font-medium">
              Your name
            </label>
            <input id="cf-name" name="name" required className={`mt-2 ${fieldClass}`} />
          </div>
          <div>
            <label htmlFor="cf-email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="cf-email"
              name="email"
              type="email"
              required
              className={`mt-2 ${fieldClass}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="cf-company" className="text-sm font-medium">
            Company <span className="text-muted-foreground">(optional)</span>
          </label>
          <input id="cf-company" name="company" className={`mt-2 ${fieldClass}`} />
        </div>

        <div>
          <label htmlFor="cf-times" className="text-sm font-medium">
            Times that suit you
          </label>
          <textarea
            id="cf-times"
            name="preferredTimes"
            rows={3}
            required
            placeholder="Tuesday afternoon, Wednesday morning, or Friday after 2:00 pm."
            className={`mt-2 ${fieldClass}`}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Share two or three options and we&apos;ll confirm one that works for both of us. Your
            timezone is detected automatically.
          </p>
        </div>

        <div>
          <label htmlFor="cf-brief" className="text-sm font-medium">
            {service ? `What would you like to cover on ${service.title}?` : 'Tell us a little about your business'}
          </label>
          <textarea
            id="cf-brief"
            name="brief"
            rows={4}
            required
            placeholder={
              service
                ? undefined
                : "What's bringing you here today? Tell us about your business, what you're working towards, and anything you'd like us to know before we meet."
            }
            className={`mt-2 ${fieldClass}`}
          />
        </div>

        <div>
          <label htmlFor="cf-budget" className="text-sm font-medium">
            Budget <span className="text-muted-foreground">(optional)</span>
          </label>
          {/* Typed, not picked from bands. Fixed ranges pushed people into the
              nearest wrong one, and a "not sure" option told us nothing. */}
          <input
            id="cf-budget"
            name="budgetRange"
            placeholder="e.g. around ₦2m, or not sure yet"
            className={`mt-2 ${fieldClass}`}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
        >
          {status === 'loading' ? 'Sending…' : submitLabel}
        </button>

        <p className="text-sm text-muted-foreground">{reassurance}</p>
      </form>
    </div>
  )
}
