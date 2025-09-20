
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Color palette - consolidated single export
export const colors = {
  // Primary colors
  primary: '#6750A4',
  primaryContainer: '#EADDFF',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#21005D',

  // Secondary colors
  secondary: '#625B71',
  secondaryContainer: '#E8DEF8',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#1D192B',

  // Tertiary colors
  tertiary: '#7D5260',
  tertiaryContainer: '#FFD8E4',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#31111D',

  // Error colors
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#410002',
  errorBackground: '#FFEAEA',

  // Success colors
  success: '#006E1C',
  successContainer: '#97F68D',
  onSuccess: '#FFFFFF',
  onSuccessContainer: '#002204',

  // Warning colors
  warning: '#8C5000',
  warningContainer: '#FFDCBE',
  onWarning: '#FFFFFF',
  onWarningContainer: '#2D1600',

  // Surface colors
  surface: '#FEF7FF',
  surfaceDim: '#DED8E1',
  surfaceBright: '#FEF7FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F7F2FA',
  surfaceContainer: '#F1ECF4',
  surfaceContainerHigh: '#ECE6F0',
  surfaceContainerHighest: '#E6E0E9',
  surfaceVariant: '#E7E0EC',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',

  // Background colors
  background: '#FEF7FF',
  onBackground: '#1C1B1F',

  // Outline colors
  outline: '#79747E',
  outlineVariant: '#CAC4D0',

  // Text colors
  text: '#1C1B1F',
  textSecondary: '#49454F',
  textTertiary: '#79747E',
  textDisabled: '#CAC4D0',

  // Other colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  disabled: '#CAC4D0',
  border: '#E7E0EC',
  shadow: 'rgba(0, 0, 0, 0.1)',
  
  // Additional colors for compatibility
  accent: '#64B5F6',
  card: '#FFFFFF',
};

// Spacing - consolidated single export
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius - consolidated single export
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Typography - consolidated single export
export const typography = StyleSheet.create({
  // Display styles
  displayLarge: {
    fontSize: 57,
    lineHeight: 64,
    fontWeight: '400',
    letterSpacing: -0.25,
    color: colors.text,
  },
  displayMedium: {
    fontSize: 45,
    lineHeight: 52,
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.text,
  },
  displaySmall: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.text,
  },

  // Headline styles
  headlineLarge: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.text,
  },
  headlineMedium: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.text,
  },
  headlineSmall: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.text,
  },

  // Title styles
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    letterSpacing: 0,
    color: colors.text,
  },
  titleMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.15,
    color: colors.text,
  },
  titleSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: colors.text,
  },

  // Label styles
  labelLarge: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.1,
    color: colors.text,
  },
  labelMedium: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.text,
  },
  labelSmall: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.text,
  },

  // Body styles
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: colors.text,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    letterSpacing: 0.25,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: 0.4,
    color: colors.text,
  },

  // Legacy styles for compatibility
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.text,
  },
  h2: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600',
    color: colors.text,
  },
  h3: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    color: colors.text,
  },
  h4: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
    color: colors.text,
  },
  h5: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    color: colors.text,
  },
  h6: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    color: colors.text,
  },
});

// Button styles - consolidated single export
export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});

// Common styles - consolidated single export
export const commonStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: `0px 4px 12px ${colors.shadow}`,
    elevation: 6,
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.outline,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  searchBar: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.onPrimary,
  },
  buttonTextSecondary: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.onSecondaryContainer,
  },
  buttonTextOutline: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.primary,
  },
  shadow: {
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    marginVertical: spacing.md,
  },
  chip: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    color: colors.text,
  },
});
