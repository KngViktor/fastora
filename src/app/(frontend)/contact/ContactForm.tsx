'use client'

import React, { useState } from 'react'

import { analytics } from '@/lib/analytics'

const fieldClass =
  'rounded-xl border border-border bg-muted px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/40'

export const ContactForm: React.FC = () => {
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
        analytics.formSubmission('contact', false)
        return
      }
      setStatus('success')
      analytics.formSubmission('contact')
      form.reset()
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
      analytics.formSubmission('contact', false)
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-3xl border border-secondary/40 bg-secondary/10 p-8 text-center">
        <h3 className="text-xl font-semibold">Thanks, we&apos;ve got your message.</h3>
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name <span className="text-secondary">*</span>
          </label>
          <input id="name" name="name" required placeholder="Your name" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email Address <span className="text-secondary">*</span>
          </label>
          <input id="email" name="email" type="email" required placeholder="you@company.com" className={fieldClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-sm font-medium">
            Phone Number <span className="text-muted-foreground">(Optional)</span>
          </label>
          <input id="phone" name="phone" type="tel" placeholder="+234 700 000 0000" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="company" className="text-sm font-medium">
            Company / Organisation <span className="text-muted-foreground">(Optional)</span>
          </label>
          <input id="company" name="company" placeholder="Company name" className={fieldClass} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="brief" className="text-sm font-medium">
          Message <span className="text-secondary">*</span>
        </label>
        <textarea
          id="brief"
          name="brief"
          required
          rows={5}
          placeholder="What can we help you with?"
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100"
      >
        {status === 'loading' ? 'Sending…' : 'Send Message'}
      </button>

      {/* Sits under the button rather than above the form: it answers "what
          happens if I send this?", which is the question a reader has at the
          moment of deciding, not when they start typing. */}
      <p className="text-sm text-muted-foreground">
        Within one business day we&apos;ll get back to you. Looking to book a strategy session
        instead? <a href="/consultation" className="font-medium text-secondary hover:underline">Book a consultation</a>.
      </p>
    </form>
  )
}
