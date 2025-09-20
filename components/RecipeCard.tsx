
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Recipe } from '../types/Recipe';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
  showFavorite?: boolean;
}

export default function RecipeCard({ recipe, onPress, showFavorite = true }: RecipeCardProps) {
  const formatTime = (minutes?: number) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
    <TouchableOpacity
      style={[commonStyles.card, { marginBottom: spacing.md }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={commonStyles.row}>
        {/* Recipe Image Placeholder */}
        <View style={{
          width: 80,
          height: 80,
          backgroundColor: colors.surfaceVariant,
          borderRadius: borderRadius.md,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: spacing.md,
        }}>
          <Icon name="restaurant" size={24} color={colors.textSecondary} />
        </View>

        {/* Recipe Info */}
        <View style={{ flex: 1 }}>
          <View style={[commonStyles.spaceBetween, { marginBottom: spacing.xs }]}>
            <Text style={[typography.titleMedium, { flex: 1, marginRight: spacing.sm }]} numberOfLines={1}>
              {recipe.title}
            </Text>
            {showFavorite && recipe.is_favorite && (
              <Icon name="heart" size={16} color={colors.error} />
            )}
          </View>

          {recipe.description && (
            <Text
              style={[typography.bodySmall, { color: colors.textSecondary, marginBottom: spacing.xs }]}
              numberOfLines={2}
            >
              {recipe.description}
            </Text>
          )}

          {/* Recipe Meta */}
          <View style={commonStyles.row}>
            {recipe.prep_time && (
              <View style={[commonStyles.row, { marginRight: spacing.md }]}>
                <Icon name="time" size={12} color={colors.textSecondary} />
                <Text style={[typography.labelSmall, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
                  {formatTime(recipe.prep_time)}
                </Text>
              </View>
            )}

            {recipe.difficulty && (
              <View style={[commonStyles.row, { marginRight: spacing.md }]}>
                <View style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: getDifficultyColor(recipe.difficulty),
                  marginRight: spacing.xs,
                }} />
                <Text style={[typography.labelSmall, { color: colors.textSecondary }]}>
                  {recipe.difficulty}
                </Text>
              </View>
            )}

            {recipe.rating && (
              <View style={commonStyles.row}>
                <Icon name="star" size={12} color={colors.warning} />
                <Text style={[typography.labelSmall, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
                  {recipe.rating}/5
                </Text>
              </View>
            )}
          </View>

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <View style={[commonStyles.row, { marginTop: spacing.xs, flexWrap: 'wrap' }]}>
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[commonStyles.chip, { marginBottom: spacing.xs }]}>
                  <Text style={commonStyles.chipText}>{tag}</Text>
                </View>
              ))}
              {recipe.tags.length > 3 && (
                <Text style={[typography.labelSmall, { color: colors.textSecondary }]}>
                  +{recipe.tags.length - 3} more
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
