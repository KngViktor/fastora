'use client'

import React, { useEffect, useRef, useState } from 'react'

import { CURRENCIES, SWITCHABLE_CURRENCIES } from '@/config/currencies'
import { useCurrency } from '@/providers/Currency'

/**
 * Manual currency switcher. The active currency is auto-detected from the
 * visitor's country (see proxy.ts); this lets them override it. The choice is
 * persisted via cookie and wins over geo detection on future visits.
 */
export const CurrencySwitcher: React.FC<{ className?: string }> = ({ className }) => {
  const { code, currency, setCurrency } = useCurrency()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${className || ''}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${currency.name}. Change currency`}
        className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
      >
        <span aria-hidden="true">{currency.symbol}</span>
        <span>{code}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Currency"
          className="absolute right-0 z-50 mt-2 max-h-80 w-52 overflow-auto rounded-2xl border border-border bg-background/95 p-1.5 shadow-xl backdrop-blur-xl"
        >
          {SWITCHABLE_CURRENCIES.map((c) => {
            const cur = CURRENCIES[c]
            if (!cur) return null
            const active = c === code
            return (
              <li key={c}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setCurrency(c)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                    active ? 'text-secondary' : 'text-foreground/80'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-center" aria-hidden="true">
                      {cur.symbol}
                    </span>
                    <span>{cur.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{cur.code}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
