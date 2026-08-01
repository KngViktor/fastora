import type { CollectionConfig } from 'payload'

import { admins } from '../../access/admins'
import { authenticated } from '../../access/authenticated'
import { getServerSideURL } from '../../utilities/getURL'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    // Any authenticated user (admin or editor) can reach the admin panel and
    // read the team list, but only admins can create, edit, or remove users.
    admin: authenticated,
    create: admins,
    delete: admins,
    read: authenticated,
    update: admins,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
    components: {
      beforeListTable: [
        {
          path: '@/components/AdminListCreateBanner',
          clientProps: { collectionSlug: 'users', label: 'User' },
        },
      ],
    },
  },
  auth: {
    forgotPassword: {
      generateEmailSubject: () => 'Reset your Fastora password',
      generateEmailHTML: (args) => {
        const token = (args as { token?: string } | undefined)?.token ?? ''
        const resetURL = `${getServerSideURL()}/admin/reset/${token}`
        return `<!doctype html>
<html>
  <body style="margin:0;background:#f4f6fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;">
      <tr>
        <td align="center">
          <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e3e8ef;">
            <tr>
              <td style="background:#0B2545;padding:22px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em;">Fastora</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 12px;font-size:20px;">Reset your password</h1>
                <p style="margin:0 0 24px;line-height:1.6;color:#5B6472;">We received a request to reset the password for your Fastora admin account. Click the button below to choose a new password. This link expires in one hour.</p>
                <a href="${resetURL}" style="display:inline-block;background:#2B7FD6;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:10px;font-weight:600;">Reset password</a>
                <p style="margin:24px 0 0;line-height:1.6;color:#5B6472;font-size:13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
                <p style="margin:16px 0 0;line-height:1.6;color:#9aa3b2;font-size:12px;word-break:break-all;">Or paste this link into your browser:<br>${resetURL}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
      },
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Demo (read-only)', value: 'demo' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Admins manage everything including team members. Editors manage content. Demo accounts can browse every collection but cannot create, edit, or delete anything — safe to share. Add more roles here as needed.',
      },
      // Only admins can change roles; a user cannot escalate their own role.
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
  timestamps: true,
  versions: false,
}
