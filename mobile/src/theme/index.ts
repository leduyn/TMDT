/**
 * TMDT Premium Design System
 * Modern Vietnamese B2B E-commerce Theme
 */

export const Colors = {
  // Primary brand (Stitch Professional Blue)
  primary: '#002045',
  primaryLight: '#1a365d',
  primaryDark: '#00142A',
  primarySoft: '#F0F4FA',

  // Accent (Stitch Action Orange)
  accent: '#F2994A',
  accentLight: '#FFA454',

  // Gradients
  gradientStart: '#1a365d',
  gradientMid: '#002045',
  gradientEnd: '#0A192F',

  // Semantic
  success: '#27AE60',       // Success Green
  successLight: '#EAF7EE',
  warning: '#F2994A',       // Amber/Orange
  warningLight: '#FEF3C7',
  error: '#E11D48',         // Debt Red
  errorLight: '#FFF0F2',
  info: '#0284C7',
  infoLight: '#E0F2FE',

  // Neutrals
  white: '#FFFFFF',
  background: '#f7f9fb',    // Slate-50/Stitch Background
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  divider: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textAccent: '#002045',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.5)',
  glass: 'rgba(255, 255, 255, 0.85)',
  glassDark: 'rgba(15, 23, 42, 0.7)',

  // Tab bar
  tabActive: '#002045',
  tabInactive: '#94A3B8',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  hero: 34,
};

export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
};
