'use client'

import React, { useState } from 'react'

import { cn } from '@/utilities/ui'

const VARIANTS = {
  dark: {
    wrapper: 'flex gap-2',
    input:
      'min-w-0 flex-1 rounded-full border border-primary-foreground/20 bg-transparent px-4 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
    button:
      'shrink-0 rounded-full bg-primary-foreground px-4 py-2 text-sm font-medium text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60',
    success: 'text-sm text-primary-foreground/80',
  },
  light: {
    wrapper: 'mx-auto flex max-w-md flex-col gap-3 sm:flex-row',
    input:
      'min-w-0 flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-secondary focus-visible:ring-2 focus-visible:ring-secondary/40',
    button:
      'shrink-0 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60',
    success: 'text-sm text-muted-foreground',
  },
} as const

export const NewsletterForm: React.FC<{ variant?: keyof typeof VARIANTS; source: string; className?: string }> = ({
  variant = 'dark',
  source,
  className,
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const styles = VARIANTS[variant]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, source }),
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
    return <p className={cn('mt-4', styles.success, className)}>You&apos;re on the list — thanks for subscribing.</p>
  }

  return (
    <form onSubmit={handleSubmit} className={cn('mt-4', className)}>
      <div className={styles.wrapper}>
        {/* Honeypot — visually hidden, ignored by real users. */}
        <div aria-hidden="true" className="absolute left-[-9999px]">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          aria-label="Email address"
          className={styles.input}
        />
        <button type="submit" disabled={status === 'loading'} className={styles.button}>
          {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  )
}
