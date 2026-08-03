import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const Colors = {
  forest: '#174C3C',
  forestDeep: '#0F382D',
  forestSoft: '#DDE9E1',
  leaf: '#6F8F78',
  cream: '#F3E8D2',
  creamLight: '#FAF5EA',
  canvas: '#FCFAF5',
  surface: '#FFFFFF',
  charcoal: '#222722',
  textMuted: '#6F756F',
  textSubtle: '#959A94',
  border: '#E9E5DC',
  borderStrong: '#DCD7CC',
  white: '#FFFFFF',
  danger: '#A04A40',
  transparent: 'transparent',
  light: {
    text: '#222722',
    background: '#FCFAF5',
    tint: '#174C3C',
    icon: '#6F756F',
    tabIconDefault: '#959A94',
    tabIconSelected: '#174C3C',
  },
  dark: {
    text: '#FCFAF5',
    background: '#0F382D',
    tint: '#F3E8D2',
    icon: '#DDE9E1',
    tabIconDefault: '#959A94',
    tabIconSelected: '#F3E8D2',
  },
} as const;

export const Spacing = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const Radii = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const Typography = {
  display: {
    fontSize: 36,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -1.1,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.7,
  },
  heading: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '700',
    letterSpacing: -0.25,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  overline: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export const Shadows = {
  soft: Platform.select<ViewStyle>({
    ios: {
      shadowColor: Colors.forestDeep,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.07,
      shadowRadius: 18,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }),
} as const;

// Kept for compatibility with the original starter components while they are phased out.
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
