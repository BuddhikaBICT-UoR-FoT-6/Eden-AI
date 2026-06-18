/**
 * Eden AI Theme System
 *
 * Simplified to Light and Dark modes.
 */

export type ThemeId = 'dark' | 'light';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
  /** CSS Custom Property overrides applied to :root */
  tokens: Record<string, string>;
  /** CSS class added to <body> */
  bodyClass: string;
}

// ─── Theme Definitions ────────────────────────────────────────────────────────

export const THEMES: Record<ThemeId, ThemeConfig> = {

  // ── DEFAULT DARK ──────────────────────────────────────────────────────────
  dark: {
    id: 'dark',
    label: 'Dark',
    emoji: '🌙',
    description: 'Default premium dark mode',
    bodyClass: 'theme-dark',
    tokens: {
      '--color-bg':           '#0a0e1a',
      '--color-surface':      '#111827',
      '--color-surface-2':    '#1a2235',
      '--color-border':       'rgba(255, 255, 255, 0.08)',
      '--color-text':         '#f0f4ff',
      '--color-text-muted':   '#8892a4',
      '--color-primary':      '#6366f1',
      '--color-primary-glow': 'rgba(99, 102, 241, 0.35)',
      '--color-accent':       '#34d399',
      '--color-accent-2':     '#f59e0b',
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)',
      '--gradient-text':      'linear-gradient(135deg, #a5b4fc 0%, #34d399 100%)',
    },
  },

  // ── LIGHT ─────────────────────────────────────────────────────────────────
  light: {
    id: 'light',
    label: 'Light',
    emoji: '☀️',
    description: 'Clean light mode',
    bodyClass: 'theme-light',
    tokens: {
      '--color-bg':           '#f8fafc',
      '--color-surface':      '#ffffff',
      '--color-surface-2':    '#f1f5f9',
      '--color-border':       'rgba(0, 0, 0, 0.08)',
      '--color-text':         '#0f172a',
      '--color-text-muted':   '#64748b',
      '--color-primary':      '#4f46e5',
      '--color-primary-glow': 'rgba(79, 70, 229, 0.2)',
      '--color-accent':       '#059669',
      '--color-accent-2':     '#d97706',
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(79,70,229,0.1) 0%, transparent 70%)',
      '--gradient-text':      'linear-gradient(135deg, #4f46e5 0%, #059669 100%)',
    },
  },
};

// ─── Theme Detection Helpers ──────────────────────────────────────────────────

/**
 * Returns the appropriate theme based on system preference.
 */
export function detectCalendarTheme(): ThemeId {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

/**
 * Detects a cultural theme based on property metadata (vibes, location, name).
 * Used to show cultural identity as a foreground overlay on property cards.
 */
export function detectPropertyCultureTheme(
  vibes: string[],
  location: string,
  name: string,
): string | null {
  const text = [...vibes, location, name].join(' ').toLowerCase();

  // Buddhist / Sinhala indicators
  const sinhalaBuddhist = ['temple', 'dagoba', 'stupa', 'kandyan', 'perahera', 'poya',
    'vesak', 'buddha', 'bo tree', 'vihara', 'pinnawala', 'sigiriya', 'dambulla',
    'anuradhapura', 'polonnaruwa', 'sinhala', 'sinhalese', 'kandy'];

  // Tamil Hindu indicators
  const tamilHindu = ['kovil', 'gopuram', 'murugan', 'pongal', 'deepavali', 'diwali',
    'vel', 'kolam', 'jaffna', 'batticaloa', 'trincomalee', 'tamil', 'hindu',
    'nallur', 'kataragama', 'skanda', 'thirukovil'];

  // Muslim / Moor indicators
  const muslim = ['mosque', 'masjid', 'eid', 'halal', 'moor', 'muslim', 'islamic',
    'ramadan', 'beruwala', 'kattankudy', 'mannar', 'puttalam', 'arab'];

  if (sinhalaBuddhist.some(kw => text.includes(kw))) return 'sinhala-buddhist';
  if (tamilHindu.some(kw => text.includes(kw)))      return 'tamil-hindu';
  if (muslim.some(kw => text.includes(kw)))           return 'muslim';

  return null;
}
