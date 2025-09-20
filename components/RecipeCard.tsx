
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Pressable } from 'react-native';
import { Recipe } from '../types/Recipe';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';
import { getImageDisplayUri } from '../utils/imageUtils';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  showFavorite?: boolean;
  viewMode?: 'grid' | 'list';
  index?: number;
}

export default function RecipeCard({ 
  recipe, 
  onPress, 
  showFavorite = true, 
  viewMode = 'grid',
  index = 0 
}: RecipeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatTime = (minutes?: number): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty?: string): string => {
    switch (difficulty) {
      case 'Easy': return colors.success;
      case 'Medium': return colors.warning;
      case 'Hard': return colors.error;
      default: return colors.textSecondary;
    }
  };

  // Extract image from notes (temporary solution until proper image storage)
  const getRecipeImage = (): string | null => {
    if (!recipe.notes) return null;
    
    const imageMatch = recipe.notes.match(/\[IMAGE:([^\]]+)\]/);
    return imageMatch ? imageMatch[1] : null;
  };

  const recipeImage = getRecipeImage();

  if (viewMode === 'list') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.md,
            marginBottom: spacing.md,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          {/* Image */}
          <View style={{
            width: 80,
            height: 80,
            borderRadius: borderRadius.md,
            backgroundColor: colors.surfaceVariant,
            marginRight: spacing.md,
            overflow: 'hidden',
          }}>
            {recipeImage ? (
              <Image
                source={{ uri: getImageDisplayUri(recipeImage) }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            ) : (
              <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Icon name="restaurant" size={24} color={colors.textSecondary} />
              </View>
            )}
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text style={[typography.titleMedium, { flex: 1, marginRight: spacing.sm }]} numberOfLines={1}>
                {recipe.title}
              </Text>
              {showFavorite && recipe.is_favorite && (
                <Icon name="heart" size={16} color={colors.primary} />
              )}
            </View>

            {recipe.description && (
              <Text style={[typography.bodySmall, { 
                color: colors.textSecondary, 
                marginTop: spacing.xs 
              }]} numberOfLines={2}>
                {recipe.description}
              </Text>
            )}

            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginTop: spacing.sm,
              gap: spacing.md 
            }}>
              {recipe.prep_time && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={[typography.labelSmall, { 
                    color: colors.textSecondary, 
                    marginLeft: spacing.xs 
                  }]}>
                    {formatTime(recipe.prep_time)}
                  </Text>
                </View>
              )}

              {recipe.difficulty && (
                <View style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 2,
                  borderRadius: borderRadius.sm,
                  backgroundColor: getDifficultyColor(recipe.difficulty) + '20',
                }}>
                  <Text style={[typography.labelSmall, { 
                    color: getDifficultyColor(recipe.difficulty),
                    fontSize: 10,
                  }]}>
                    {recipe.difficulty}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Grid view
  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          overflow: 'hidden',
          marginBottom: spacing.md,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        {/* Image */}
        <View style={{
          height: 140,
          backgroundColor: colors.surfaceVariant,
          position: 'relative',
        }}>
          {recipeImage ? (
            <Image
              source={{ uri: getImageDisplayUri(recipeImage) }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Icon name="restaurant" size={32} color={colors.textSecondary} />
            </View>
          )}

          {/* Favorite indicator */}
          {showFavorite && recipe.is_favorite && (
            <View style={{
              position: 'absolute',
              top: spacing.sm,
              right: spacing.sm,
              backgroundColor: colors.background + 'E6',
              borderRadius: borderRadius.full,
              padding: spacing.xs,
            }}>
              <Icon name="heart" size={16} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ padding: spacing.md }}>
          <Text style={typography.titleMedium} numberOfLines={1}>
            {recipe.title}
          </Text>

          {recipe.description && (
            <Text style={[typography.bodySmall, { 
              color: colors.textSecondary, 
              marginTop: spacing.xs 
            }]} numberOfLines={2}>
              {recipe.description}
            </Text>
          )}

          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: spacing.sm 
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              {recipe.prep_time && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={[typography.labelSmall, { 
                    color: colors.textSecondary, 
                    marginLeft: spacing.xs 
                  }]}>
                    {formatTime(recipe.prep_time)}
                  </Text>
                </View>
              )}
            </View>

            {recipe.difficulty && (
              <View style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: 2,
                borderRadius: borderRadius.sm,
                backgroundColor: getDifficultyColor(recipe.difficulty) + '20',
              }}>
                <Text style={[typography.labelSmall, { 
                  color: getDifficultyColor(recipe.difficulty),
                  fontSize: 10,
                }]}>
                  {recipe.difficulty}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
