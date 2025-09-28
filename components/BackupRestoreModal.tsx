
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';
import VersionCompatibilityInfo from './VersionCompatibilityInfo';
import { BackupMetadata } from '../types/Sharing';
import { checkBackupCompatibility, validateBackupIntegrity } from '../utils/backupVersioning';
import { getMigrationInfo } from '../utils/database';

interface BackupRestoreModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRestore: (mode: 'replace' | 'merge') => Promise<void>;
  backupData: any;
  backupMetadata: BackupMetadata;
}

const BackupRestoreModal: React.FC<BackupRestoreModalProps> = ({
  isVisible,
  onClose,
  onRestore,
  backupData,
  backupMetadata
}) => {
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('merge');
  const [currentVersion, setCurrentVersion] = useState(1);
  const [compatibility, setCompatibility] = useState<any>(null);
  const [validation, setValidation] = useState<any>(null);

  useEffect(() => {
    if (isVisible) {
      loadCompatibilityInfo();
    }
  }, [isVisible, backupMetadata]);

  const loadCompatibilityInfo = async () => {
    try {
      const migrationInfo = await getMigrationInfo();
      setCurrentVersion(migrationInfo.currentVersion);
      
      const compatibilityResult = await checkBackupCompatibility(backupMetadata);
      setCompatibility(compatibilityResult);
      
      const validationResult = validateBackupIntegrity(backupData);
      setValidation(validationResult);
    } catch (error) {
      console.error('Failed to load compatibility info:', error);
    }
  };

  const handleRestore = async () => {
    if (!validation?.valid) {
      Alert.alert('Invalid Backup', 'This backup file is corrupted or invalid.');
      return;
    }

    if (compatibility?.requiresUpdate) {
      Alert.alert(
        'Update Required',
        'This backup requires a newer version of the app. Please update and try again.'
      );
      return;
    }

    try {
      setIsRestoring(true);
      await onRestore(restoreMode);
      onClose();
    } catch (error) {
      console.error('Restore failed:', error);
      Alert.alert('Restore Failed', 'Could not restore backup. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCancel = () => {
    if (!isRestoring) {
      onClose();
    }
  };

  const renderBackupInfo = () => (
    <View style={styles.backupInfo}>
      <Text style={[typography.titleLarge, { color: colors.text }]}>
        Restore Backup
      </Text>
      
      <View style={styles.infoRow}>
        <Icon name="calendar" size={16} color={colors.textSecondary} />
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginLeft: 8 }]}>
          Created: {new Date(backupMetadata.created).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Icon name="restaurant" size={16} color={colors.textSecondary} />
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginLeft: 8 }]}>
          {backupMetadata.count} recipes
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Icon name="code-working" size={16} color={colors.textSecondary} />
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginLeft: 8 }]}>
          App version: {backupMetadata.app}
        </Text>
      </View>
    </View>
  );

  const renderValidationStatus = () => {
    if (!validation) return null;

    if (!validation.valid) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={24} color={colors.error} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[typography.titleMedium, { color: colors.error }]}>
              Invalid Backup
            </Text>
            <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 4 }]}>
              {validation.errors.join(', ')}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.successContainer}>
        <Icon name="checkmark-circle" size={20} color={colors.success} />
        <Text style={[typography.bodyMedium, { color: colors.success, marginLeft: 8 }]}>
          Backup file is valid
        </Text>
      </View>
    );
  };

  const renderRestoreOptions = () => {
    if (!validation?.valid) return null;

    return (
      <View style={styles.optionsContainer}>
        <Text style={[typography.titleMedium, { color: colors.text, marginBottom: spacing.md }]}>
          Restore Mode
        </Text>

        <TouchableOpacity
          style={[
            styles.optionButton,
            restoreMode === 'merge' && styles.optionButtonSelected
          ]}
          onPress={() => setRestoreMode('merge')}
        >
          <View style={styles.optionContent}>
            <Icon 
              name="add-circle" 
              size={20} 
              color={restoreMode === 'merge' ? colors.primary : colors.textSecondary} 
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[
                typography.titleSmall, 
                { color: restoreMode === 'merge' ? colors.primary : colors.text }
              ]}>
                Merge with existing
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                Add recipes that don't already exist
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionButton,
            restoreMode === 'replace' && styles.optionButtonSelected
          ]}
          onPress={() => setRestoreMode('replace')}
        >
          <View style={styles.optionContent}>
            <Icon 
              name="refresh-circle" 
              size={20} 
              color={restoreMode === 'replace' ? colors.primary : colors.textSecondary} 
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[
                typography.titleSmall, 
                { color: restoreMode === 'replace' ? colors.primary : colors.text }
              ]}>
                Replace all data
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                Clear existing recipes and restore from backup
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWarnings = () => {
    if (!compatibility) return null;

    const warnings = [];

    if (compatibility.dataLoss) {
      warnings.push({
        icon: 'warning' as const,
        color: colors.warning,
        title: 'Potential Data Loss',
        message: 'Some data may be lost due to version differences.'
      });
    }

    if (restoreMode === 'replace') {
      warnings.push({
        icon: 'alert-circle' as const,
        color: colors.error,
        title: 'Data Will Be Replaced',
        message: 'All existing recipes will be permanently deleted.'
      });
    }

    if (warnings.length === 0) return null;

    return (
      <View style={styles.warningsContainer}>
        {warnings.map((warning, index) => (
          <View key={index} style={styles.warningItem}>
            <Icon name={warning.icon} size={20} color={warning.color} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typography.titleSmall, { color: warning.color }]}>
                {warning.title}
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 2 }]}>
                {warning.message}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleCancel}
            disabled={isRestoring}
            style={styles.closeButton}
          >
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[typography.titleLarge, { color: colors.text }]}>
            Restore Backup
          </Text>
          
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderBackupInfo()}
          {renderValidationStatus()}
          
          {compatibility && (
            <VersionCompatibilityInfo
              shareVersion={backupMetadata.schema}
              currentVersion={currentVersion}
            />
          )}
          
          {renderRestoreOptions()}
          {renderWarnings()}
        </ScrollView>

        {validation?.valid && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isRestoring}
            >
              <Text style={[typography.labelLarge, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.restoreButton, isRestoring && styles.buttonDisabled]}
              onPress={handleRestore}
              disabled={isRestoring || !compatibility?.compatible}
            >
              {isRestoring ? (
                <Text style={[typography.labelLarge, { color: colors.onPrimary }]}>
                  Restoring...
                </Text>
              ) : (
                <Text style={[typography.labelLarge, { color: colors.onPrimary }]}>
                  Restore Backup
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  backupInfo: {
    paddingVertical: spacing.md,
  },
  infoRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: colors.errorContainer,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  successContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.successContainer,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  optionsContainer: {
    marginVertical: spacing.lg,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryContainer,
  },
  optionContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  warningsContainer: {
    marginVertical: spacing.md,
  },
  warningItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: colors.warningContainer,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row' as const,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outline,
    gap: spacing.md,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelButton: {
    backgroundColor: colors.surfaceVariant,
  },
  restoreButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
};

export default BackupRestoreModal;
