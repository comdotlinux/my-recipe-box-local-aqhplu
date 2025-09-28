
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Share, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import Clipboard from '@react-native-clipboard/clipboard';
import { commonStyles, colors, typography, spacing, borderRadius } from '../../styles/commonStyles';
import { RootState, AppDispatch } from '../../store';
import { loadRecipe, toggleFavorite, deleteRecipe } from '../../store/slices/recipesSlice';
import Icon from '../../components/Icon';
import ShareOptionsSheet from '../../components/ShareOptionsSheet';
import QRCodeSheet from '../../components/QRCodeSheet';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentRecipe, loading } = useSelector((state: RootState) => state.recipes);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'instructions' | 'notes'>('ingredients');
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [showQRSheet, setShowQRSheet] = useState(false);
  const [qrData, setQRData] = useState<{ deepLink: string; recipe: any } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      console.log('Loading recipe details for ID:', id);
      dispatch(loadRecipe(id));
    }
  }, [id, dispatch]);

  const handleToggleFavorite = async () => {
    if (currentRecipe) {
      try {
        console.log('Toggling favorite for recipe:', currentRecipe.id);
        const result = await dispatch(toggleFavorite(currentRecipe)).unwrap();
        
        // Show toast notification
        Toast.show({
          type: 'success',
          text1: result.is_favorite ? 'Added to Favorites' : 'Removed from Favorites',
          text2: result.is_favorite 
            ? `"${result.title}" is now in your favorites.`
            : `"${result.title}" has been removed from favorites.`,
          position: 'bottom',
          bottomOffset: 100,
        });
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to Update Favorite',
          text2: error instanceof Error ? error.message : 'Unknown error. Please try again.',
          position: 'bottom',
          bottomOffset: 100,
        });
      }
    }
  };

  const handleEditRecipe = () => {
    console.log('Editing recipe:', id);
    // TODO: Navigate to edit screen
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Edit functionality will be implemented in the next phase.',
      position: 'bottom',
      bottomOffset: 100,
    });
  };

  const handleDeleteRecipe = () => {
    if (!currentRecipe || isDeleting) return;

    Alert.alert(
      'Delete Recipe',
      `Are you sure you want to delete "${currentRecipe.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              console.log('Deleting recipe:', currentRecipe.id);
              
              // Dispatch the delete action and wait for it to complete
              await dispatch(deleteRecipe(currentRecipe.id)).unwrap();
              
              console.log('Recipe deleted successfully');
              
              // Show success toast
              Toast.show({
                type: 'success',
                text1: 'Recipe Deleted',
                text2: `"${currentRecipe.title}" has been removed from your collection.`,
                position: 'bottom',
                bottomOffset: 100,
              });
              
              // Navigate back immediately after successful deletion
              router.back();
              
            } catch (error) {
              console.error('Failed to delete recipe:', error);
              setIsDeleting(false);
              Toast.show({
                type: 'error',
                text1: 'Failed to Delete Recipe',
                text2: error instanceof Error ? error.message : 'Unknown error. Please try again.',
                position: 'bottom',
                bottomOffset: 100,
              });
            }
          },
        },
      ]
    );
  };

  const handleViewOriginalRecipe = async () => {
    if (!currentRecipe?.source_url) {
      Toast.show({
        type: 'error',
        text1: 'No Source URL',
        text2: 'This recipe does not have an original source URL.',
        position: 'bottom',
        bottomOffset: 100,
      });
      return;
    }

    const url = currentRecipe.source_url;
    console.log('Attempting to open URL:', url);

    // Show action sheet to let user choose between opening or copying
    Alert.alert(
      'View Original Recipe',
      `Would you like to open the link or copy it to clipboard?\n\n${url}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy Link',
          onPress: async () => {
            try {
              await Clipboard.setString(url);
              Toast.show({
                type: 'success',
                text1: 'Link Copied',
                text2: 'The recipe URL has been copied to your clipboard.',
                position: 'bottom',
                bottomOffset: 100,
              });
            } catch (error) {
              console.error('Failed to copy to clipboard:', error);
              Toast.show({
                type: 'error',
                text1: 'Copy Failed',
                text2: 'Could not copy the link to clipboard.',
                position: 'bottom',
                bottomOffset: 100,
              });
            }
          },
        },
        {
          text: 'Open Link',
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
                Toast.show({
                  type: 'success',
                  text1: 'Opening Link',
                  text2: 'The original recipe is opening in your browser.',
                  position: 'bottom',
                  bottomOffset: 100,
                });
              } else {
                // If can't open, copy to clipboard as fallback
                await Clipboard.setString(url);
                Toast.show({
                  type: 'info',
                  text1: 'Link Copied',
                  text2: 'Could not open the link, but it has been copied to your clipboard.',
                  position: 'bottom',
                  bottomOffset: 100,
                });
              }
            } catch (error) {
              console.error('Failed to open URL:', error);
              // Fallback to copying
              try {
                await Clipboard.setString(url);
                Toast.show({
                  type: 'info',
                  text1: 'Link Copied',
                  text2: 'Could not open the link, but it has been copied to your clipboard.',
                  position: 'bottom',
                  bottomOffset: 100,
                });
              } catch (clipboardError) {
                Toast.show({
                  type: 'error',
                  text1: 'Failed to Open Link',
                  text2: 'Could not open or copy the link. Please try again.',
                  position: 'bottom',
                  bottomOffset: 100,
                });
              }
            }
          },
        },
      ]
    );
  };

  const handleShareRecipe = () => {
    if (!currentRecipe) return;
    setShowShareSheet(true);
  };

  const handleShowQRCode = (qrCodeData: { deepLink: string; recipe: any }) => {
    setQRData(qrCodeData);
    setShowQRSheet(true);
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

  const renderTabButton = (tab: typeof activeTab, label: string) => (
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        backgroundColor: activeTab === tab ? colors.primary : colors.surface,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.xs,
      }}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={{
        ...typography.labelMedium,
        color: activeTab === tab ? colors.background : colors.text,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderIngredients = () => {
    if (!currentRecipe?.ingredients) {
      return (
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, fontStyle: 'italic' }]}>
          No ingredients listed
        </Text>
      );
    }

    const ingredientsList = currentRecipe.ingredients.split('\n').filter(Boolean);
    
    return (
      <View>
        {ingredientsList.map((ingredient, index) => (
          <View key={index} style={[commonStyles.row, { marginBottom: spacing.sm }]}>
            <View style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.primary,
              marginRight: spacing.md,
              marginTop: 8,
            }} />
            <Text style={[typography.bodyMedium, { flex: 1 }]}>
              {ingredient.trim()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderInstructions = () => {
    if (!currentRecipe?.instructions) {
      return (
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, fontStyle: 'italic' }]}>
          No instructions provided
        </Text>
      );
    }

    const instructionsList = currentRecipe.instructions.split('\n').filter(Boolean);
    
    return (
      <View>
        {instructionsList.map((instruction, index) => (
          <View key={index} style={[commonStyles.row, { marginBottom: spacing.md, alignItems: 'flex-start' }]}>
            <View style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: spacing.md,
              marginTop: 2,
            }}>
              <Text style={[typography.labelSmall, { color: colors.background }]}>
                {index + 1}
              </Text>
            </View>
            <Text style={[typography.bodyMedium, { flex: 1, lineHeight: 22 }]}>
              {instruction.trim()}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderNotes = () => {
    if (!currentRecipe?.notes) {
      return (
        <Text style={[typography.bodyMedium, { color: colors.textSecondary, fontStyle: 'italic' }]}>
          No notes added
        </Text>
      );
    }

    return (
      <Text style={[typography.bodyMedium, { lineHeight: 22 }]}>
        {currentRecipe.notes}
      </Text>
    );
  };

  if (loading || !currentRecipe) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <View style={[commonStyles.container, commonStyles.centerContent]}>
          <Text style={[typography.bodyLarge, { color: colors.textSecondary }]}>
            Loading recipe...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={{ padding: spacing.md, paddingBottom: spacing.sm }}>
          <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
            <TouchableOpacity onPress={() => router.back()}>
              <Icon name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            
            <View style={commonStyles.row}>
              <TouchableOpacity
                style={{ marginRight: spacing.md }}
                onPress={handleToggleFavorite}
              >
                <Icon 
                  name={currentRecipe.is_favorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={currentRecipe.is_favorite ? colors.error : colors.text} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ marginRight: spacing.md }}
                onPress={handleShareRecipe}
              >
                <Icon name="share" size={24} color={colors.text} />
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleEditRecipe}>
                <Icon name="create" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
          {/* Recipe Image Placeholder */}
          <View style={{
            height: 200,
            backgroundColor: colors.surfaceVariant,
            marginHorizontal: spacing.md,
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
          <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
            <Text style={[typography.headlineSmall, { marginBottom: spacing.sm }]}>
              {currentRecipe.title}
            </Text>
            
            {currentRecipe.description && (
              <Text style={[typography.bodyLarge, { 
                color: colors.textSecondary, 
                marginBottom: spacing.md,
                lineHeight: 22 
              }]}>
                {currentRecipe.description}
              </Text>
            )}

            {/* Recipe Meta */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {currentRecipe.prep_time && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <Icon name="time" size={14} color={colors.textSecondary} />
                  <Text style={[commonStyles.chipText, { marginLeft: spacing.xs }]}>
                    Prep: {formatTime(currentRecipe.prep_time)}
                  </Text>
                </View>
              )}
              
              {currentRecipe.cook_time && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <Icon name="flame" size={14} color={colors.textSecondary} />
                  <Text style={[commonStyles.chipText, { marginLeft: spacing.xs }]}>
                    Cook: {formatTime(currentRecipe.cook_time)}
                  </Text>
                </View>
              )}
              
              {currentRecipe.servings && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <Icon name="people" size={14} color={colors.textSecondary} />
                  <Text style={[commonStyles.chipText, { marginLeft: spacing.xs }]}>
                    Serves {currentRecipe.servings}
                  </Text>
                </View>
              )}
              
              {currentRecipe.difficulty && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <View style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: getDifficultyColor(currentRecipe.difficulty),
                    marginRight: spacing.xs,
                  }} />
                  <Text style={commonStyles.chipText}>
                    {currentRecipe.difficulty}
                  </Text>
                </View>
              )}
              
              {currentRecipe.rating && (
                <View style={[commonStyles.row, commonStyles.chip]}>
                  <Icon name="star" size={14} color={colors.warning} />
                  <Text style={[commonStyles.chipText, { marginLeft: spacing.xs }]}>
                    {currentRecipe.rating}/5
                  </Text>
                </View>
              )}
            </View>

            {/* Tags */}
            {currentRecipe.tags && currentRecipe.tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md }}>
                {currentRecipe.tags.map((tag, index) => (
                  <View key={index} style={[commonStyles.chip, { marginBottom: spacing.xs }]}>
                    <Text style={commonStyles.chipText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Tab Navigation */}
          <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', marginBottom: spacing.lg }}>
              {renderTabButton('ingredients', 'Ingredients')}
              {renderTabButton('instructions', 'Instructions')}
              {renderTabButton('notes', 'Notes')}
            </View>

            {/* Tab Content */}
            <View style={[commonStyles.card, { minHeight: 200 }]}>
              {activeTab === 'ingredients' && renderIngredients()}
              {activeTab === 'instructions' && renderInstructions()}
              {activeTab === 'notes' && renderNotes()}
            </View>
          </View>

          {/* Source URL */}
          {currentRecipe.source_url && (
            <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
              <TouchableOpacity
                style={[commonStyles.card, commonStyles.row]}
                onPress={handleViewOriginalRecipe}
              >
                <Icon name="link" size={20} color={colors.primary} />
                <Text style={[typography.bodyMedium, { 
                  color: colors.primary, 
                  marginLeft: spacing.sm,
                  flex: 1 
                }]} numberOfLines={1}>
                  View Original Recipe
                </Text>
                <Icon name="open" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Delete Button */}
          <View style={{ paddingHorizontal: spacing.md }}>
            <TouchableOpacity
              style={[commonStyles.card, { 
                backgroundColor: colors.error + '10',
                borderColor: colors.error,
                borderWidth: 1,
                opacity: isDeleting ? 0.6 : 1,
              }]}
              onPress={handleDeleteRecipe}
              disabled={isDeleting}
            >
              <View style={[commonStyles.row, { justifyContent: 'center' }]}>
                <Icon name="trash" size={20} color={colors.error} />
                <Text style={[typography.labelLarge, { 
                  color: colors.error, 
                  marginLeft: spacing.sm 
                }]}>
                  {isDeleting ? 'Deleting...' : 'Delete Recipe'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Share Options Sheet */}
        <ShareOptionsSheet
          recipe={currentRecipe}
          isVisible={showShareSheet}
          onClose={() => setShowShareSheet(false)}
          onShowQRCode={handleShowQRCode}
        />

        {/* QR Code Sheet */}
        <QRCodeSheet
          qrData={qrData}
          isVisible={showQRSheet}
          onClose={() => setShowQRSheet(false)}
        />
      </View>
    </SafeAreaView>
  );
}
