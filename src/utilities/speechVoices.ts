export type RankedVoice = {
  voice: SpeechSynthesisVoice
  /** What to show in the picker — the raw names are long and vendor-noisy. */
  label: string
  /** Higher is better. Only meaningful for sorting within one device's list. */
  score: number
}

/**
 * English-speaking African locales, best first for this site's readers.
 *
 * Fastora writes from Nigeria for a mostly Nigerian audience, so en-NG leads.
 * The rest follow because a Ghanaian or Kenyan voice still reads this writing
 * far more naturally than the en-US default a phone would otherwise pick.
 */
const AFRICAN_REGIONS = ['NG', 'GH', 'KE', 'ZA', 'TZ', 'UG', 'ZW', 'RW', 'ZM', 'BW']

/**
 * Markers vendors put in voice names to mean "the good one".
 *
 * Every platform spells it differently: Edge and Windows say Natural or
 * Online, Apple says Enhanced or Premium, some Android builds say Neural.
 * Matching on all of them is what separates a voice people will listen to
 * from the flat default.
 */
const QUALITY_MARKERS: { pattern: RegExp; bonus: number }[] = [
  { pattern: /\bnatural\b|\bneural\b/i, bonus: 60 },
  { pattern: /\bpremium\b|\benhanced\b/i, bonus: 45 },
  { pattern: /\bonline\b/i, bonus: 30 },
]

/**
 * Voices that exist for compatibility rather than for listening to. Apple's
 * "compact" set is the low-bandwidth fallback, and Eloquence is a 1980s
 * formant synthesiser kept for screen-reader users who are used to it.
 */
const LOW_QUALITY = /\bcompact\b|\beloquence\b/i

/**
 * Tidies "Microsoft Ezinne Online (Natural) - English (Nigeria)" into
 * "Ezinne (Natural) — English (Nigeria)".
 *
 * The vendor prefix goes, but the quality marker stays: Apple ships
 * "Samantha" and "Samantha (Enhanced)" side by side, and dropping it would
 * put two identical-looking entries in the picker, one of which sounds
 * markedly worse than the other.
 */
function labelFor(voice: SpeechSynthesisVoice): string {
  const [namePart, ...rest] = voice.name.split(' - ')

  const name = (namePart ?? voice.name)
    .replace(/^(Microsoft|Google|Apple)\s+/i, '')
    .replace(/\s+Online\b/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  const region = rest.join(' - ').trim()

  return region ? `${name} — ${region}` : name || voice.name
}

/**
 * Orders the voices this device can actually speak with, best first.
 *
 * The browser only offers what the reader's own operating system has
 * installed — a page cannot ship a voice — so this is about choosing well
 * from that list rather than settling for the default, which is usually the
 * flattest one present.
 *
 * On Edge that is worth a lot: it exposes Microsoft's cloud "Natural" voices
 * to any page, Nigerian Ezinne and Abeo among them, so readers there get the
 * accent this site is written in at no cost to anyone.
 */
export function rankVoices(voices: SpeechSynthesisVoice[]): RankedVoice[] {
  return voices
    .filter((voice) => {
      // Edge 150 shipped a bug where cloud voices come back as
      // "Microsoft undefined Online (Natural) - undefined". Speaking with one
      // silently falls back to the default voice, so they are dropped rather
      // than offered as a choice that does nothing.
      if (!voice?.name || !voice.lang || voice.name.includes('undefined')) return false

      return voice.lang.toLowerCase().startsWith('en')
    })
    .map((voice) => {
      const region = voice.lang.split(/[-_]/)[1]?.toUpperCase() ?? ''
      const africanRank = AFRICAN_REGIONS.indexOf(region)

      let score = 0

      // Dominates every other signal: a Nigerian voice reading Nigerian
      // writing is worth more than a crisper recording of the wrong accent.
      if (africanRank !== -1) score += 1000 - africanRank * 10

      for (const { pattern, bonus } of QUALITY_MARKERS) {
        if (pattern.test(voice.name)) score += bonus
      }

      // Cloud voices are the better ones wherever both exist.
      if (!voice.localService) score += 20

      if (LOW_QUALITY.test(voice.name)) score -= 80

      // Only as a tiebreak. The platform default is a reasonable last word
      // between two otherwise equal voices, and a poor reason to pick one.
      if (voice.default) score += 5

      return { voice, label: labelFor(voice), score }
    })
    .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label))
}

/** The voice to use when the reader has not chosen one. */
export function bestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return rankVoices(voices)[0]?.voice ?? null
}
