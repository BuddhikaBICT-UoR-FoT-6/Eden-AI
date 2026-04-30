/**
 * Eden AI Theme System
 *
 * Culturally-informed theme definitions for Sri Lanka's tourism context.
 *
 * Research Basis:
 * ─────────────────────────────────────────────────────────────────────────────
 * DRY/WET SEASONS:
 *   Sri Lanka has two monsoon-driven seasons per region:
 *   - Southwest: Dry=Dec–Mar, Wet=May–Sep (Yala monsoon)
 *   - Northeast: Dry=May–Sep, Wet=Oct–Jan (Maha monsoon)
 *   UI: dry = warm amber/terracotta; wet = lush emerald/teal
 *
 * POYA DAY (Full Moon):
 *   Government holiday every full moon. Colors = white (purity), saffron
 *   (monks' robes), gold. Symbols: lotus, oil lamps (pol-thel pahana),
 *   Vesak lanterns (Vesak kumbilikka), Bo tree leaves.
 *   Key Poyas: Vesak (May), Poson (June), Esala (July/Aug).
 *
 * AVURUDU (Sinhala & Tamil New Year — Apr 13/14):
 *   Auspicious colors per astrology: typically gold/mustard for the year.
 *   Symbols: oil lamp (pahana), kiribath (milk rice), traditional games
 *   (kamba adeema, onchilli), jasmine, mango leaves, clay pots.
 *   Mood: warm festive, family, transition from old to new year.
 *
 * CHRISTMAS (Sri Lanka):
 *   Strong in coastal fishing communities (Negombo - "Little Rome"),
 *   Mannar, Batticaloa. Unique blend: tropical setting, papaya/pineapple
 *   fruit, sarong-wearing Santa, Catholic church architecture.
 *   Colors: coastal teal, coral, traditional red/gold but tropical-warm.
 *
 * SINHALA BUDDHIST CULTURE:
 *   Colors: saffron (#FF8C00), maroon (#800000), lotus pink, gold.
 *   Symbols: Dhamma Chakra (8-spoked wheel), lotus, dagoba (stupa),
 *   Bo tree (Ficus religiosa), Kandyan perahera (procession), Vesak lantern.
 *   Festivals: Vesak, Poson, Esala Perahera (Kandy), Kataragama.
 *
 * TAMIL HINDU CULTURE:
 *   Colors: deep crimson (#DC143C), turmeric yellow (#E8B86D), kumkum red,
 *   gold, peacock blue (Lord Murugan's vahana).
 *   Symbols: Vel (trident of Murugan), Kolam (floor patterns), Kovil
 *   gopuram (tower), Pongal clay pot, banana leaf, jasmine (malli).
 *   Festivals: Thai Pongal (Jan), Maha Shivaratri, Vel festival (Jul),
 *   Deepavali (Oct/Nov), Karthigai Deepam.
 *
 * SRI LANKA MUSLIM CULTURE:
 *   Sri Lanka Moors — largest Muslim community, descended from Arab traders.
 *   Colors: forest green (#1B5E20), gold (#CFB53B), white, crescent silver.
 *   Symbols: crescent & star, geometric arabesque patterns, mosque arch,
 *   string hoppers (idiappa) — cultural food symbol.
 *   Festivals: Eid ul-Fitr (end of Ramadan), Eid ul-Adha (Hajj season),
 *   Milad un-Nabi (Prophet's birthday), Ramadan lanterns.
 */

export type ThemeId =
  | 'dark'
  | 'light'
  | 'dry-season'
  | 'wet-season'
  | 'poya'
  | 'avurudu'
  | 'christmas'
  | 'sinhala-buddhist'
  | 'tamil-hindu'
  | 'muslim';

export interface ThemeConfig {
  id: ThemeId;
  label: string;
  emoji: string;
  description: string;
  /** CSS Custom Property overrides applied to :root */
  tokens: Record<string, string>;
  /** CSS class added to <body> for pattern/texture overlays */
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
    },
  },

  // ── DRY SEASON (Dec–Mar Southwest / May–Sep Northeast) ───────────────────
  'dry-season': {
    id: 'dry-season',
    label: 'Dry Season',
    emoji: '🌤️',
    description: 'Warm amber tones of Sri Lanka\'s dry season',
    bodyClass: 'theme-dry-season',
    tokens: {
      '--color-bg':           '#1a1008',
      '--color-surface':      '#2d1f0e',
      '--color-surface-2':    '#3d2a12',
      '--color-border':       'rgba(205, 133, 63, 0.2)',
      '--color-text':         '#fdf6ec',
      '--color-text-muted':   '#c4956a',
      '--color-primary':      '#d97706',  // Amber — parched earth
      '--color-primary-glow': 'rgba(217, 119, 6, 0.3)',
      '--color-accent':       '#b45309',  // Terracotta
      '--color-accent-2':     '#92400e',
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(217,119,6,0.25) 0%, transparent 70%)',
    },
  },

  // ── WET SEASON (May–Sep Southwest / Oct–Jan Northeast) ───────────────────
  'wet-season': {
    id: 'wet-season',
    label: 'Wet Season',
    emoji: '🌿',
    description: 'Lush emerald greens of monsoon season',
    bodyClass: 'theme-wet-season',
    tokens: {
      '--color-bg':           '#071a0f',
      '--color-surface':      '#0d2818',
      '--color-surface-2':    '#143d25',
      '--color-border':       'rgba(52, 211, 153, 0.15)',
      '--color-text':         '#ecfdf5',
      '--color-text-muted':   '#6ee7b7',
      '--color-primary':      '#10b981',  // Emerald — lush jungle
      '--color-primary-glow': 'rgba(16, 185, 129, 0.3)',
      '--color-accent':       '#059669',  // Deep green
      '--color-accent-2':     '#0891b2',  // Rain-blue
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16,185,129,0.2) 0%, transparent 70%)',
    },
  },

  // ── POYA DAY (Full Moon Buddhist Holiday) ────────────────────────────────
  poya: {
    id: 'poya',
    label: 'Poya Day',
    emoji: '🪷',
    description: 'Serene full moon — white lotus, saffron, sacred gold',
    bodyClass: 'theme-poya',
    tokens: {
      '--color-bg':           '#110e00',
      '--color-surface':      '#1e1900',
      '--color-surface-2':    '#2d2600',
      '--color-border':       'rgba(255, 215, 0, 0.15)',
      '--color-text':         '#fffde7',
      '--color-text-muted':   '#d4a017',
      '--color-primary':      '#f59e0b',  // Saffron — monk robes
      '--color-primary-glow': 'rgba(245, 158, 11, 0.35)',
      '--color-accent':       '#fbbf24',  // Gold — oil lamp flame
      '--color-accent-2':     '#f8f0ff',  // Lotus white
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.2) 0%, transparent 70%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 50%)',
    },
  },

  // ── AVURUDU (Sinhala & Tamil New Year — Apr 13/14) ───────────────────────
  avurudu: {
    id: 'avurudu',
    label: 'Avurudu',
    emoji: '🎊',
    description: 'Sinhala & Tamil New Year — festive gold, mango, jasmine',
    bodyClass: 'theme-avurudu',
    tokens: {
      '--color-bg':           '#1a0a00',
      '--color-surface':      '#2d1500',
      '--color-surface-2':    '#3d2000',
      '--color-border':       'rgba(251, 191, 36, 0.2)',
      '--color-text':         '#fff7ed',
      '--color-text-muted':   '#fb923c',
      '--color-primary':      '#ea580c',  // Deep mango orange
      '--color-primary-glow': 'rgba(234, 88, 12, 0.35)',
      '--color-accent':       '#fbbf24',  // Auspicious mustard gold
      '--color-accent-2':     '#dc2626',  // Traditional crimson
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(234,88,12,0.25) 0%, transparent 70%)',
    },
  },

  // ── CHRISTMAS (Tropical Sri Lankan Christmas — Negombo, Mannar) ──────────
  christmas: {
    id: 'christmas',
    label: 'Christmas',
    emoji: '🌴',
    description: 'Tropical Christmas — coastal teal, coral, festive red',
    bodyClass: 'theme-christmas',
    tokens: {
      '--color-bg':           '#001a15',
      '--color-surface':      '#00261c',
      '--color-surface-2':    '#003326',
      '--color-border':       'rgba(239, 68, 68, 0.2)',
      '--color-text':         '#f0fdf4',
      '--color-text-muted':   '#6ee7b7',
      '--color-primary':      '#dc2626',  // Cardinal red
      '--color-primary-glow': 'rgba(220, 38, 38, 0.3)',
      '--color-accent':       '#16a34a',  // Tropical palm green
      '--color-accent-2':     '#fbbf24',  // Gold star
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(220,38,38,0.15) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(22,163,74,0.15) 0%, transparent 60%)',
    },
  },

  // ── SINHALA BUDDHIST ──────────────────────────────────────────────────────
  'sinhala-buddhist': {
    id: 'sinhala-buddhist',
    label: 'Sinhala Buddhist',
    emoji: '☸️',
    description: 'Saffron robes, dagoba white, Bo tree gold — Buddhist Sri Lanka',
    bodyClass: 'theme-sinhala-buddhist',
    tokens: {
      '--color-bg':           '#120800',
      '--color-surface':      '#1e1000',
      '--color-surface-2':    '#2d1800',
      '--color-border':       'rgba(255, 140, 0, 0.2)',
      '--color-text':         '#fff8f0',
      '--color-text-muted':   '#cd853f',
      '--color-primary':      '#ff8c00',  // Saffron — Buddhist monks
      '--color-primary-glow': 'rgba(255, 140, 0, 0.35)',
      '--color-accent':       '#8b0000',  // Maroon — robe trim
      '--color-accent-2':     '#ffd700',  // Temple gold
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,140,0,0.2) 0%, transparent 70%)',
    },
  },

  // ── TAMIL HINDU ───────────────────────────────────────────────────────────
  'tamil-hindu': {
    id: 'tamil-hindu',
    label: 'Tamil Hindu',
    emoji: '🪔',
    description: 'Turmeric gold, kumkum crimson, kolam patterns — Tamil Sri Lanka',
    bodyClass: 'theme-tamil-hindu',
    tokens: {
      '--color-bg':           '#1a0008',
      '--color-surface':      '#2d000e',
      '--color-surface-2':    '#3d001a',
      '--color-border':       'rgba(220, 20, 60, 0.2)',
      '--color-text':         '#fff0f5',
      '--color-text-muted':   '#f9a8d4',
      '--color-primary':      '#dc143c',  // Kumkum crimson — Lord Murugan
      '--color-primary-glow': 'rgba(220, 20, 60, 0.35)',
      '--color-accent':       '#e8b86d',  // Turmeric yellow
      '--color-accent-2':     '#1d4ed8',  // Peacock blue — Murugan's vahana
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(220,20,60,0.2) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(232,184,109,0.15) 0%, transparent 60%)',
    },
  },

  // ── MUSLIM (Sri Lanka Moor) ───────────────────────────────────────────────
  muslim: {
    id: 'muslim',
    label: 'Muslim',
    emoji: '☪️',
    description: 'Forest green, crescent gold, arabesque — Sri Lanka Moor heritage',
    bodyClass: 'theme-muslim',
    tokens: {
      '--color-bg':           '#001208',
      '--color-surface':      '#001f0f',
      '--color-surface-2':    '#002d18',
      '--color-border':       'rgba(207, 181, 59, 0.2)',
      '--color-text':         '#f0fff4',
      '--color-text-muted':   '#86efac',
      '--color-primary':      '#166534',  // Forest green — Islam
      '--color-primary-glow': 'rgba(22, 101, 52, 0.35)',
      '--color-accent':       '#cfb53b',  // Old gold — crescent
      '--color-accent-2':     '#ffffff',  // White — purity
      '--hero-gradient':      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(22,101,52,0.25) 0%, transparent 70%)',
    },
  },
};

// ─── Calendar Auto-Detection ──────────────────────────────────────────────────

/**
 * Returns the appropriate theme based on today's Sri Lanka cultural calendar.
 * Priority: Cultural holidays > Seasons > Default dark
 */
export function detectCalendarTheme(): ThemeId {
  const now = new Date();
  const month = now.getMonth() + 1; // 1–12
  const day   = now.getDate();

  // Sinhala & Tamil New Year: April 13–15
  if (month === 4 && day >= 13 && day <= 15) return 'avurudu';

  // Christmas Season: December 20–26
  if (month === 12 && day >= 20 && day <= 26) return 'christmas';

  // Vesak Poya (approx May full moon) — simplified to May
  if (month === 5 && isPoyaDay(now)) return 'poya';

  // Poson Poya (June full moon)
  if (month === 6 && isPoyaDay(now)) return 'poya';

  // Esala Poya (July/August)
  if ((month === 7 || month === 8) && isPoyaDay(now)) return 'poya';

  // All other Poya days
  if (isPoyaDay(now)) return 'poya';

  // Dry season — Southwest Sri Lanka (Dec–Mar)
  if (month >= 12 || month <= 3) return 'dry-season';

  // Wet season — Southwest Sri Lanka (May–Sep, peak Yala monsoon)
  if (month >= 5 && month <= 9) return 'wet-season';

  return 'dark';
}

/**
 * Detects the Poya (full moon) day using lunar phase approximation.
 * Uses the known cycle of ~29.53 days from a reference full moon.
 */
function isPoyaDay(date: Date): boolean {
  // Reference full moon: January 13, 2025 (known Poya)
  const REFERENCE_FULL_MOON = new Date('2025-01-13T00:00:00Z');
  const LUNAR_CYCLE_DAYS = 29.53059;

  const msSinceReference = date.getTime() - REFERENCE_FULL_MOON.getTime();
  const daysSinceReference = msSinceReference / (1000 * 60 * 60 * 24);
  const phase = ((daysSinceReference % LUNAR_CYCLE_DAYS) + LUNAR_CYCLE_DAYS) % LUNAR_CYCLE_DAYS;

  // Full moon window: ±1.5 days around the peak (phase ≈ 0 or ≈ 29.53)
  return phase <= 1.5 || phase >= (LUNAR_CYCLE_DAYS - 1.5);
}

/**
 * Detects a cultural theme based on property metadata (vibes, location, name).
 * Used to show cultural identity as a foreground overlay on property cards.
 */
export function detectPropertyCultureTheme(
  vibes: string[],
  location: string,
  name: string,
): ThemeId | null {
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
