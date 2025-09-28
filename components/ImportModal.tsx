
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';
import { ImportValidationResult } from '../types/Sharing';
import { convertToRecipe, handleImport as handleVersionedImport, getCompatibleFields } from '../utils/sharing';

interface ImportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onImport: (recipe: any) => Promise<void>;
  validationResult: ImportValidationResult | null;
  shareData?: string; // Base64 encoded share data for versioned imports
}

const ImportModal: React.FC<ImportModalProps> = ({
  isVisible,
  onClose,
  onImport,
  validationResult,
  shareData
}) => {
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = async () => {
    if (!validationResult?.isValid || !validationResult.recipe) {
      return;
    }

    try {
      setIsImporting(true);
      
      let recipeData;
      
      // Handle versioned imports if shareData is provided
      if (shareData) {
        const importResult = await handleVersionedImport(shareData);
        if (importResult.error) {
          throw new Error(importResult.error);
        }
        recipeData = importResult.recipe;
      } else {
        // Legacy import
        recipeData = convertToRecipe(validationResult.recipe);
      }
      
      await onImport(recipeData);
      onClose();
    } catch (error) {
      console.error('Import failed:', error);
      Alert.alert('Import Failed', 'Could not import recipe. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    if (!isImporting) {
      onClose();
    }
  };

  const renderVersionInfo = () => {
    if (!validationResult?.shareVersion || !validationResult?.currentVersion) {
      return null;
    }

    const { shareVersion, currentVersion } = validationResult;
    
    if (shareVersion > currentVersion) {
      return (
        <View style={styles.versionWarning}>
          <Icon name="warning" size={20} color={colors.warning} />
          <Text style={[typography.bodyMedium, { color: colors.warning, marginLeft: 8 }]}>
            Recipe from newer app version (v{shareVersion}). Update required.
          </Text>
        </View>
      );
    }

    if (shareVersion < currentVersion) {
      return (
        <View style={styles.versionInfo}>
          <Icon name="information-circle" size={20} color={colors.primary} />
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginLeft: 8 }]}>
            Recipe from older version (v{shareVersion}). Will be updated to v{currentVersion}.
          </Text>
        </View>
      );
    }

    return null;
  };

  const renderError = () => {
    if (!validationResult || validationResult.isValid) {
      return null;
    }

    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle" size={24} color={colors.error} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[typography.titleMedium, { color: colors.error }]}>
            Import Failed
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: 4 }]}>
            {validationResult.errorMessage}
          </Text>
        </View>
      </View>
    );
  };

  const renderRecipePreview = () => {
    if (!validationResult?.isValid || !validationResult.recipe) {
      return null;
    }

    const recipe = validationResult.recipe;

    return (
      <View style={styles.recipePreview}>
        <Text style={[typography.titleLarge, { color: colors.text }]}>
          {recipe.title}
        </Text>
        
        {recipe.description && (
          <Text style={[typography.bodyMedium, { 
            color: colors.textSecondary, 
            marginTop: 8 
          }]}>
            {recipe.description}
          </Text>
        )}

        <View style={styles.recipeDetails}>
          {recipe.servings && (
            <View style={styles.detailItem}>
              <Icon name="people" size={16} color={colors.textSecondary} />
              <Text style={[typography.bodySmall, { 
                color: colors.textSecondary, 
                marginLeft: 6 
              }]}>
                {recipe.servings} servings
              </Text>
            </View>
          )}

          {recipe.prep_time && (
            <View style={styles.detailItem}>
              <Icon name="time" size={16} color={colors.textSecondary} />
              <Text style={[typography.bodySmall, { 
                color: colors.textSecondary, 
                marginLeft: 6 
              }]}>
                {recipe.prep_time} min prep
              </Text>
            </View>
          )}

          {recipe.difficulty && (
            <View style={styles.detailItem}>
              <Icon name="bar-chart" size={16} color={colors.textSecondary} />
              <Text style={[typography.bodySmall, { 
                color: colors.textSecondary, 
                marginLeft: 6 
              }]}>
                {recipe.difficulty}
              </Text>
            </View>
          )}
        </View>

        {recipe.ingredients && (
          <View style={styles.section}>
            <Text style={[typography.titleMedium, { color: colors.text }]}>
              Ingredients
            </Text>
            <Text style={[typography.bodyMedium, { 
              color: colors.textSecondary, 
              marginTop: 8,
              lineHeight: 20
            }]} numberOfLines={3}>
              {recipe.ingredients}
            </Text>
          </View>
        )}

        {recipe.instructions && (
          <View style={styles.section}>
            <Text style={[typography.titleMedium, { color: colors.text }]}>
              Instructions
            </Text>
            <Text style={[typography.bodyMedium, { 
              color: colors.textSecondary, 
              marginTop: 8,
              lineHeight: 20
            }]} numberOfLines={3}>
              {recipe.instructions}
            </Text>
          </View>
        )}
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
            disabled={isImporting}
            style={styles.closeButton}
          >
            <Icon name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[typography.titleLarge, { color: colors.text }]}>
            Import Recipe
          </Text>
          
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderVersionInfo()}
          {renderError()}
          {renderRecipePreview()}
        </ScrollView>

        {validationResult?.isValid && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isImporting}
            >
              <Text style={[typography.labelLarge, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.importButton, isImporting && styles.buttonDisabled]}
              onPress={handleImport}
              disabled={isImporting}
            >
              {isImporting ? (
                <Text style={[typography.labelLarge, { color: colors.onPrimary }]}>
                  Importing...
                </Text>
              ) : (
                <Text style={[typography.labelLarge, { color: colors.onPrimary }]}>
                  Import Recipe
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
  versionWarning: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.warningContainer,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  versionInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: colors.primaryContainer,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  errorContainer: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    backgroundColor: colors.errorContainer,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  recipePreview: {
    paddingVertical: spacing.md,
  },
  recipeDetails: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  detailItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  section: {
    marginTop: spacing.lg,
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
  importButton: {
    backgroundColor: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
};

export default ImportModal;
