
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { ShareableRecipe } from '../../types/Sharing';
import { convertToRecipe } from '../../utils/sharing';
import { createRecipe } from '../../store/slices/recipesSlice';
import { AppDispatch } from '../../store';
import { commonStyles, colors, typography, spacing, borderRadius } from '../../styles/commonStyles';
import Icon from '../../components/Icon';

export default function ImportPreviewScreen() {
  const { recipeData } = useLocalSearchParams<{ recipeData: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [isImporting, setIsImporting] = useState(false);

  if (!recipeData) {
    router.replace('/');
    return null;
  }

  let shareableRecipe: ShareableRecipe;
  try {
    shareableRecipe = JSON.parse(decodeURIComponent(recipeData));
  } catch (error) {
    console.error('Failed to parse recipe data:', error);
    Alert.alert('Import Error', 'Invalid recipe data');
    router.replace('/');
    return null;
  }

  const handleImportRecipe = async () => {
    setIsImporting(true);
    
    try {
      console.log('Importing recipe:', shareableRecipe.title);
      
      const recipeToImport = convertToRecipe(shareableRecipe);
      const recipeId = await dispatch(createRecipe(recipeToImport)).unwrap();
      
      Alert.alert(
        'Recipe Imported!',
        `"${shareableRecipe.title}" has been added to your recipe collection.`,
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
      Alert.alert('Import Failed', 'Unable to import recipe. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
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
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={{ padding: spacing.md, paddingBottom: spacing.sm }}>
          <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
            <TouchableOpacity onPress={handleCancel}>
              <Icon name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <Text style={typography.titleLarge}>
              Import Recipe
            </Text>
            
            <View style={{ width: 24 }} />
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          {/* Import Status */}
          <View style={[commonStyles.card, { 
            marginHorizontal: spacing.md,
            marginBottom: spacing.lg,
            backgroundColor: colors.success + '20',
            borderColor: colors.success,
            borderWidth: 1,
          }]}>
            <View style={[commonStyles.row, { alignItems: 'center' }]}>
              <Icon name="checkmark-circle" size={24} color={colors.success} />
              <View style={{ marginLeft: spacing.md, flex: 1 }}>
                <Text style={[typography.titleMedium, { color: colors.success }]}>
                  Recipe Validated
                </Text>
                <Text style={[typography.bodySmall, { color: colors.success }]}>
                  Ready to import into your collection
                </Text>
              </View>
            </View>
          </View>

          {/* Recipe Preview */}
          <View style={{ paddingHorizontal: spacing.md }}>
            {/* Recipe Image Placeholder */}
            <View style={{
              height: 200,
              backgroundColor: colors.surfaceVariant,
              borderRadius: borderRadius.lg,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: spacing.lg,
            }}>
              <Icon name="camera" size={48} color={colors.textSecondary} />
              <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                Recipe Photo
              </Text>
            </View>

            {/* Recipe Title and Info */}
            <Text style={[typography.headlineSmall, { marginBottom: spacing.sm }]}>
              {shareableRecipe.title}
            </Text>
            
            {shareableRecipe.description && (
              <Text style={[typography.bodyLarge, { 
                color: colors.textSecondary, 
                marginBottom: spacing.md,
                lineHeight: 22 
              }]}>
                {shareableRecipe.description}
              </Text>
            )}

            {/* Recipe Meta */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg }}>
              {shareableRecipe.prep_time && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <Icon name="time" size={14} color={colors.textSecondary} />
                  <Text style={[commonStyles.chipText, { marginLeft: spacing.xs }]}>
                    Prep: {formatTime(shareableRecipe.prep_time)}
                  </Text>
                </View>
              )}
              
              {shareableRecipe.cook_time && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <Icon name="flame" size={14} color={colors.textSecondary} />
                  <Text style={[commonStyles.chipText, { marginLeft: spacing.xs }]}>
                    Cook: {formatTime(shareableRecipe.cook_time)}
                  </Text>
                </View>
              )}
              
              {shareableRecipe.servings && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <Icon name="people" size={14} color={colors.textSecondary} />
                  <Text style={[commonStyles.chipText, { marginLeft: spacing.xs }]}>
                    Serves {shareableRecipe.servings}
                  </Text>
                </View>
              )}
              
              {shareableRecipe.difficulty && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: getDifficultyColor(shareableRecipe.difficulty),
                    marginRight: spacing.xs,
                  }} />
                  <Text style={commonStyles.chipText}>
                    {shareableRecipe.difficulty}
                  </Text>
                </View>
              )}
              
              {shareableRecipe.rating && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <Icon name="star" size={14} color={colors.warning} />
                  <Text style={[commonStyles.chipText, { marginLeft: spacing.xs }]}>
                    {shareableRecipe.rating}/5
                  </Text>
                </View>
              )}
            </View>

            {/* Tags */}
            {shareableRecipe.tags && shareableRecipe.tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg }}>
                {shareableRecipe.tags.map((tag, index) => (
                  <View key={index} style={[commonStyles.chip, { marginBottom: spacing.xs }]}>
                    <Text style={commonStyles.chipText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Ingredients Preview */}
            {shareableRecipe.ingredients && (
              <View style={[commonStyles.card, { marginBottom: spacing.lg }]}>
                <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
                  Ingredients
                </Text>
                <Text style={[typography.bodyMedium, { 
                  color: colors.textSecondary,
                  lineHeight: 20 
                }]} numberOfLines={5}>
                  {shareableRecipe.ingredients}
                </Text>
              </View>
            )}

            {/* Instructions Preview */}
            {shareableRecipe.instructions && (
              <View style={[commonStyles.card, { marginBottom: spacing.lg }]}>
                <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
                  Instructions
                </Text>
                <Text style={[typography.bodyMedium, { 
                  color: colors.textSecondary,
                  lineHeight: 20 
                }]} numberOfLines={5}>
                  {shareableRecipe.instructions}
                </Text>
              </View>
            )}

            {/* Notes Preview */}
            {shareableRecipe.notes && (
              <View style={[commonStyles.card, { marginBottom: spacing.lg }]}>
                <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
                  Notes
                </Text>
                <Text style={[typography.bodyMedium, { 
                  color: colors.textSecondary,
                  lineHeight: 20 
                }]} numberOfLines={3}>
                  {shareableRecipe.notes}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={{ 
          padding: spacing.md, 
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.outline,
        }}>
          <TouchableOpacity
            style={[commonStyles.card, {
              backgroundColor: colors.primary,
              marginBottom: spacing.md,
            }]}
            onPress={handleImportRecipe}
            disabled={isImporting}
          >
            <View style={[commonStyles.row, { justifyContent: 'center' }]}>
              <Icon 
                name={isImporting ? "hourglass" : "download"} 
                size={20} 
                color={colors.background} 
              />
              <Text style={[typography.labelLarge, { 
                color: colors.background, 
                marginLeft: spacing.sm 
              }]}>
                {isImporting ? 'Importing...' : 'Import Recipe'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[commonStyles.card, {
              backgroundColor: colors.surface,
              borderColor: colors.outline,
              borderWidth: 1,
            }]}
            onPress={handleCancel}
            disabled={isImporting}
          >
            <View style={[commonStyles.row, { justifyContent: 'center' }]}>
              <Text style={[typography.labelLarge, { color: colors.text }]}>
                Cancel
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
