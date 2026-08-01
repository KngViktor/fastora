import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const BeforeLogin: React.FC = async () => {
  const payload = await getPayload({ config: configPromise })
  const siteSettings = await payload.findGlobal({ slug: 'site-settings' })

  // Same brand accent the public site and the rest of the admin use, so the
  // login screen — the one page a visitor sees before ever authenticating —
  // never shows a stale hardcoded color if the accent changes in Site Settings.
  const accent = siteSettings?.accentColor?.trim() || '#2B7FD6'

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root{--fastora-accent:${accent};--fastora-accent-hover:${accent};}`,
        }}
      />
      <div className="fastora-login-intro">
        <h1>Welcome home</h1>
        <p>Please enter your details.</p>
      </div>
    </>
  )
}

export default BeforeLogin
