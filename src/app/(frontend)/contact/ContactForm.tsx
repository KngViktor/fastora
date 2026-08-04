'use client'

import React, { useState } from 'react'

type ServiceOption = { id: number | string; title: string }

const BUDGETS = [
  { label: 'Under $1,000', value: 'under-1k' },
  { label: '$1,000 to $5,000', value: '1k-5k' },
  { label: '$5,000 to $15,000', value: '5k-15k' },
  { label: '$15,000+', value: '15k-plus' },
  { label: 'Not sure yet', value: 'not-sure' },
]

const TIMELINES = [
  { label: 'ASAP', value: 'asap' },
  { label: 'Within 1 month', value: '1-month' },
  { label: '1 to 3 months', value: '1-3-months' },
  { label: 'Just exploring', value: 'exploring' },
]

const fieldClass =
  'rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/40'

export const ContactForm: React.FC<{ services: ServiceOption[] }> = ({ services }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        setError(json?.error || 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('success')
      form.reset()
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-3xl border border-secondary/40 bg-secondary/10 p-8 text-center">
        <h3 className="text-xl font-semibold">Thanks, we&apos;ve got your brief.</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll get back to you within one business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Name <span className="text-secondary">*</span>
          </label>
          <input id="name" name="name" required placeholder="Your name" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email <span className="text-secondary">*</span>
          </label>
          <input id="email" name="email" type="email" required placeholder="you@company.com" className={fieldClass} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="company" className="text-sm font-medium">
            Company
          </label>
          <input id="company" name="company" placeholder="Company name" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="serviceNeeded" className="text-sm font-medium">
            Service needed
          </label>
          <select id="serviceNeeded" name="serviceNeeded" defaultValue="" className={fieldClass}>
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="budgetRange" className="text-sm font-medium">
            Budget
          </label>
          <select id="budgetRange" name="budgetRange" defaultValue="" className={fieldClass}>
            <option value="">Select a range…</option>
            {BUDGETS.map((b) => (
              <option key={b.value} value={b.value}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="timeline" className="text-sm font-medium">
            Timeline
          </label>
          <select id="timeline" name="timeline" defaultValue="" className={fieldClass}>
            <option value="">Select a timeline…</option>
            {TIMELINES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="brief" className="text-sm font-medium">
          Project brief <span className="text-secondary">*</span>
        </label>
        <textarea
          id="brief"
          name="brief"
          required
          rows={5}
          placeholder="Tell us what you're trying to achieve…"
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        {status === 'loading' ? 'Sending…' : 'Send project brief'}
      </button>

      {/* Sits under the button rather than above the form: it answers "what
          happens if I send this?", which is the question a reader has at the
          moment of deciding, not when they start typing. */}
      <p className="text-sm text-muted-foreground">
        Within one business day we&apos;ll review your enquiry and recommend the next step.
      </p>
    </form>
  )
}
