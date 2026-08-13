// theme/index.js — 子午·合盘 Meridian Sync
// Design tokens mirrored from the web app (public/styles.css :root),
// adapted for React Native. Refined, premium, restrained light palette.

export const colors = {
  bg: '#ffffff',
  bgTint: '#f6f5f2', // warm off-white section
  ink: '#0a0a0f', // deep ink for dark bands
  ink2: '#12121b',
  surface: '#ffffff',
  surface2: '#fbfaf8',
  line: '#e7e4dd',
  lineStrong: '#d7d3c9',
  lineDark: 'rgba(255,255,255,0.12)',
  text: '#14141b', // near-black ink
  text2: '#4a4a55', // secondary
  text3: '#82828e', // tertiary / captions
  textInv: '#f7f6f2',
  textInv2: 'rgba(247,246,242,0.66)',
  gold: '#a9803a', // refined bronze-gold accent
  gold2: '#c8a15a',
  goldSoft: '#f3ead9',
  inkAccent: '#1c1a2e',
  success: '#15803d',
  danger: '#c0392b',
  violet: '#6d5bd0',
  overlay: 'rgba(10,10,15,0.42)',
};

export const radius = { sm: 8, md: 12, lg: 18, xl: 26, pill: 999 };

export const spacing = { xs: 6, sm: 10, md: 16, lg: 24, xl: 36, xxl: 56 };

export const font = {
  // React Native uses system fonts; we lean on weight + size for hierarchy.
  serif: undefined, // fall back to system; custom fonts loaded via expo-font if desired
  sizeXs: 12,
  sizeSm: 14,
  sizeMd: 16,
  sizeLg: 20,
  sizeXl: 26,
  size2xl: 34,
  size3xl: 44,
};

export const shadow = {
  sm: {
    shadowColor: '#14141b',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  md: {
    shadowColor: '#14141b',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#14141b',
    shadowOpacity: 0.2,
    shadowRadius: 34,
    shadowOffset: { width: 0, height: 18 },
    elevation: 10,
  },
  gold: {
    shadowColor: '#a9803a',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
};

// Score → color ramp (for the compatibility dial)
export function scoreColor(n) {
  if (n >= 80) return colors.gold;
  if (n >= 65) return colors.gold2;
  if (n >= 50) return colors.violet;
  return colors.text2;
}

export default { colors, radius, spacing, font, shadow, scoreColor };
