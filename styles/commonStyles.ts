
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

export const colors = {
  primary: '#1976D2',      // Material Blue
  primaryContainer: '#E3F2FD',
  secondary: '#0D47A1',    // Darker Blue
  accent: '#64B5F6',       // Light Blue
  background: '#FFFFFF',   // White background for light theme
  surface: '#F5F5F5',      // Light grey surface
  surfaceVariant: '#E0E0E0',
  text: '#212121',         // Dark text for light theme
  textSecondary: '#757575',
  outline: '#BDBDBD',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  card: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = StyleSheet.create({
  displayLarge: {
    fontSize: 57,
    fontWeight: '400',
    lineHeight: 64,
    color: colors.text,
  },
  displayMedium: {
    fontSize: 45,
    fontWeight: '400',
    lineHeight: 52,
    color: colors.text,
  },
  displaySmall: {
    fontSize: 36,
    fontWeight: '400',
    lineHeight: 44,
    color: colors.text,
  },
  headlineLarge: {
    fontSize: 32,
    fontWeight: '400',
    lineHeight: 40,
    color: colors.text,
  },
  headlineMedium: {
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 36,
    color: colors.text,
  },
  headlineSmall: {
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 32,
    color: colors.text,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: '500',
    lineHeight: 28,
    color: colors.text,
  },
  titleMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: colors.text,
  },
  titleSmall: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.text,
  },
  bodyLarge: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    color: colors.text,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: colors.text,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    color: colors.text,
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: colors.text,
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: colors.text,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    color: colors.text,
  },
});

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginVertical: spacing.sm,
    boxShadow: `0px 2px 8px ${colors.shadow}`,
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
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.labelLarge,
    color: colors.background,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  searchBar: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.outline,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  chipText: {
    ...typography.labelSmall,
    color: colors.text,
  },
});

export const buttonStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  text: {
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
