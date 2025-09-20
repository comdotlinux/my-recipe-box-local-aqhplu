
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { ShareableRecipe, ImportValidationResult } from '../../types/Sharing';
import { convertToRecipe, parseDeepLink, handleImport } from '../../utils/sharing';
import { createRecipe } from '../../store/slices/recipesSlice';
import { AppDispatch } from '../../store';
import { commonStyles, colors, typography, spacing, borderRadius } from '../../styles/commonStyles';
import Icon from '../../components/Icon';
import ImportModal from '../../components/ImportModal';

export default function ImportPreviewScreen() {
  const { recipeData, deepLink } = useLocalSearchParams<{ recipeData?: string; deepLink?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const validateImport = async () => {
      try {
        let result: ImportValidationResult;
        
        if (deepLink) {
          // Handle new versioned deep link
          result = await parseDeepLink(decodeURIComponent(deepLink));
        } else if (recipeData) {
          // Handle legacy recipe data
          const shareableRecipe: ShareableRecipe = JSON.parse(decodeURIComponent(recipeData));
          result = {
            isValid: true,
            recipe: shareableRecipe,
            shareVersion: shareableRecipe.version || 1,
            currentVersion: 3, // Current app version
          };
        } else {
          result = {
            isValid: false,
            error: 'invalid',
            errorMessage: 'No recipe data provided',
          };
        }
        
        setValidationResult(result);
        setShowImportModal(true);
      } catch (error) {
        console.error('Failed to validate import:', error);
        setValidationResult({
          isValid: false,
          error: 'corrupted',
          errorMessage: 'Invalid recipe data',
        });
        setShowImportModal(true);
      }
    };

    validateImport();
  }, [recipeData, deepLink]);

  if (!recipeData && !deepLink) {
    router.replace('/');
    return null;
  }

  const handleImportRecipe = async (recipeData: any) => {
    try {
      console.log('Importing recipe:', recipeData.title);
      
      const recipeId = await dispatch(createRecipe(recipeData)).unwrap();
      
      Alert.alert(
        'Recipe Imported!',
        `"${recipeData.title}" has been added to your recipe collection.`,
        [
          {
            text: 'View Recipe',
            onPress: () => router.replace(`/recipe/${recipeId}`),
          },
          {
            text: 'Browse Recipes',
            onPress: () => router.replace('/(tabs)/browse'),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to import recipe:', error);
      throw error;
    }
  };

  const handleCloseModal = () => {
    setShowImportModal(false);
    router.replace('/');
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return 'Not specified';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return colors.success;
      case 'medium': return colors.warning;
      case 'hard': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <>
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={commonStyles.container}>
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: spacing.lg 
          }}>
            <Icon name="hourglass" size={48} color={colors.primary} />
            <Text style={[typography.titleMedium, { 
              color: colors.text, 
              marginTop: spacing.md,
              textAlign: 'center'
            }]}>
              Validating Recipe...
            </Text>
            <Text style={[typography.bodyMedium, { 
              color: colors.textSecondary, 
              marginTop: spacing.sm,
              textAlign: 'center'
            }]}>
              Checking compatibility and preparing import
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ImportModal
        isVisible={showImportModal}
        onClose={handleCloseModal}
        onImport={handleImportRecipe}
        validationResult={validationResult}
      />
    </>
  );
}
