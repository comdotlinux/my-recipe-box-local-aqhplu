
import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';
import { getVersionMatrix } from '../utils/backupVersioning';

interface VersionCompatibilityInfoProps {
  shareVersion: number;
  currentVersion: number;
  showMatrix?: boolean;
}

const VersionCompatibilityInfo: React.FC<VersionCompatibilityInfoProps> = ({
  shareVersion,
  currentVersion,
  showMatrix = false
}) => {
  const getCompatibilityStatus = () => {
    if (shareVersion === currentVersion) {
      return {
        status: '✅',
        message: 'Perfect compatibility',
        color: colors.success,
        icon: 'checkmark-circle' as const
      };
    }
    
    if (shareVersion > currentVersion) {
      return {
        status: '❌',
        message: 'Update required',
        color: colors.error,
        icon: 'alert-circle' as const
      };
    }
    
    if (shareVersion < currentVersion) {
      return {
        status: '⚠️',
        message: 'Will be upgraded',
        color: colors.warning,
        icon: 'information-circle' as const
      };
    }
    
    return {
      status: '❓',
      message: 'Unknown compatibility',
      color: colors.textSecondary,
      icon: 'help-circle' as const
    };
  };

  const compatibility = getCompatibilityStatus();
  const matrix = getVersionMatrix();

  // Move styles inside component to access showMatrix prop
  const styles = {
    container: {
      backgroundColor: colors.surfaceVariant,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginVertical: spacing.sm,
    },
    versionInfo: {
      marginBottom: showMatrix ? spacing.md : 0,
    },
    versionRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      marginBottom: spacing.xs,
    },
    versionDetails: {
      marginLeft: 28,
    },
    matrixContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.outline,
      paddingTop: spacing.md,
    },
    matrixRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      paddingVertical: spacing.xs,
    },
  };

  const renderVersionInfo = () => (
    <View style={styles.versionInfo}>
      <View style={styles.versionRow}>
        <Icon name={compatibility.icon} size={20} color={compatibility.color} />
        <Text style={[typography.bodyMedium, { color: compatibility.color, marginLeft: 8 }]}>
          {compatibility.message}
        </Text>
      </View>
      
      <View style={styles.versionDetails}>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
          Recipe version: v{shareVersion} → Current: v{currentVersion}
        </Text>
      </View>
    </View>
  );

  const renderMatrix = () => {
    if (!showMatrix) return null;

    return (
      <View style={styles.matrixContainer}>
        <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.md }]}>
          Version Compatibility Matrix
        </Text>
        
        {Object.entries(matrix).map(([key, value]) => (
          <View key={key} style={styles.matrixRow}>
            <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>
              {key}
            </Text>
            <Text style={[typography.bodyMedium, { marginRight: spacing.sm }]}>
              {value.status}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, flex: 2 }]}>
              {value.description}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderVersionInfo()}
      {renderMatrix()}
    </View>
  );
};

export default VersionCompatibilityInfo;
