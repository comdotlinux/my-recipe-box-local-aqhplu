
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../styles/commonStyles';

interface PlatformNoticeProps {
  message: string;
  type?: 'info' | 'warning';
}

const PlatformNotice: React.FC<PlatformNoticeProps> = ({ message, type = 'info' }) => {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={[styles.container, type === 'warning' ? styles.warning : styles.info]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  info: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary + '30',
  },
  warning: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
  },
  text: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },
});

export default PlatformNotice;
