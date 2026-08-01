import React from 'react'

/**
 * Admin logo — replaces the Payload logo on the login screen and nav header.
 * Renders the real Fastora brand mark + wordmark (public/brand/logo-color.png).
 */
const Logo: React.FC = () => {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- the Payload admin shell isn't a Next.js page, so next/image isn't available here.
    <img src="/brand/logo-color.png" alt="Fastora" height={40} style={{ height: 40, width: 'auto' }} />
  )
}

export default Logo
