import type { SiteSettings } from '@/lib/api'

/**
 * Turns the admin-editable color palette (Site Settings → Colors) into a
 * `:root { ... }` CSS override string. Each saved value overrides the matching
 * design token from globals.css; blank fields fall back to the built-in theme.
 *
 * The returned string is injected as a <style> tag in the frontend layout,
 * so changing colors in the admin recolors the entire public site.
 */
export function buildBrandStyle(colors: SiteSettings['colors'] | null | undefined): string {
  if (!colors) return ''

  const rules: string[] = []
  const set = (cssVar: string, value?: string | null) => {
    if (value && typeof value === 'string' && value.trim()) {
      rules.push(`${cssVar}: ${value.trim()};`)
    }
  }

  set('--background', colors.background)
  set('--foreground', colors.text)
  set('--color-card-foreground', colors.text)
  set('--color-primary', colors.primary)
  set('--color-primary-foreground', colors.darkPanelText)
  set('--color-card', colors.surface)
  set('--color-muted', colors.surface)
  set('--color-muted-foreground', colors.mutedText)
  set('--color-border', colors.border)

  // Gold is the emphasis accent from the brand spec. `--color-gold` already
  // has a default in globals.css, so this only overrides it when Site
  // Settings supplies a value.
  set('--color-gold', colors.gold)

  const accent = colors.accent?.trim()
  if (accent) {
    rules.push(`--color-secondary: ${accent};`)
    rules.push(`--color-accent: ${accent};`)
    rules.push(`--color-ring: ${accent};`)
    rules.push(
      `--gradient-velocity: linear-gradient(100deg, color-mix(in srgb, ${accent} 75%, #ffffff) 0%, ${accent} 100%);`,
    )
  }

  if (!rules.length) return ''
  return `:root{${rules.join('')}}`
}
