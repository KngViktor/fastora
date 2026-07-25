'use client'

import React from 'react'

import { useCurrency } from '@/providers/Currency'

/**
 * Renders a price authored in the BASE currency (see src/config/currencies.ts),
 * converted + formatted into the visitor's active currency.
 *
 *   <Price amount={500} />            → "$500" / "₦800,000" / "R9,000" …
 *   <Price amount={19.99} fractionDigits={2} />
 */
export const Price: React.FC<{
  /** Amount in the BASE currency. */
  amount: number
  fractionDigits?: number
  className?: string
}> = ({ amount, fractionDigits, className }) => {
  const { format } = useCurrency()
  return (
    <span className={className} suppressHydrationWarning>
      {format(amount, fractionDigits)}
    </span>
  )
}
