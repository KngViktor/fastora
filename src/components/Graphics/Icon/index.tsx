import React from 'react'

/**
 * Admin icon — replaces the Payload mark in the collapsed nav and favicon slots.
 * The dark Fastora icon mark (public/brand/icon-dark.png), which reads clearly
 * at small sizes against the admin's light collapsed-nav background.
 */
const Icon: React.FC = () => {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- the Payload admin shell isn't a Next.js page, so next/image isn't available here.
    <img src="/brand/icon-dark.png" alt="Fastora" height={28} style={{ height: 28, width: 'auto' }} />
  )
}

export default Icon
