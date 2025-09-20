
import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Pressable } from 'react-native';
import { Recipe } from '../types/Recipe';
import { commonStyles, colors, typography, spacing, borderRadius } from '../styles/commonStyles';
import Icon from './Icon';

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
  viewMode = 'list',
  index = 0 
}: RecipeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Stagger fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

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

  if (viewMode === 'grid') {
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          flex: 1,
          margin: spacing.xs,
        }}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            commonStyles.card,
            {
              margin: 0,
              borderRadius: borderRadius.xl,
              overflow: 'hidden',
              elevation: 2,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            }
          ]}
        >
          {/* Recipe Image with Parallax Effect */}
          <View style={{
            height: 120,
            backgroundColor: colors.surfaceVariant,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
            <Icon name="restaurant" size={32} color={colors.textSecondary} />
            
            {/* Favorite Icon Overlay */}
            {showFavorite && recipe.is_favorite && (
              <View style={{
                position: 'absolute',
                top: spacing.sm,
                right: spacing.sm,
                backgroundColor: colors.background,
                borderRadius: borderRadius.full,
                padding: spacing.xs,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}>
                <Icon name="heart" size={16} color={colors.error} />
              </View>
            )}
          </View>

          <View style={{ padding: spacing.md }}>
            {/* Title */}
            <Text 
              style={[typography.titleMedium, { marginBottom: spacing.xs }]} 
              numberOfLines={2}
            >
              {recipe.title}
            </Text>

            {/* Chips Row */}
            <View style={{ flexDirection: 'row', marginBottom: spacing.sm, flexWrap: 'wrap' }}>
              {recipe.prep_time && (
                <View style={[
                  commonStyles.chip, 
                  { 
                    backgroundColor: colors.primary + '20',
                    marginBottom: spacing.xs,
                  }
                ]}>
                  <Icon name="time-outline" size={12} color={colors.primary} />
                  <Text style={[
                    commonStyles.chipText, 
                    { color: colors.primary, marginLeft: spacing.xs }
                  ]}>
                    {formatTime(recipe.prep_time)}
                  </Text>
                </View>
              )}

              {recipe.rating && (
                <View style={[
                  commonStyles.chip, 
                  { 
                    backgroundColor: colors.warning + '20',
                    marginBottom: spacing.xs,
                  }
                ]}>
                  <Icon name="star" size={12} color={colors.warning} />
                  <Text style={[
                    commonStyles.chipText, 
                    { color: colors.warning, marginLeft: spacing.xs }
                  ]}>
                    {recipe.rating}
                  </Text>
                </View>
              )}
            </View>

            {/* Description */}
            {recipe.description && (
              <Text
                style={[typography.bodySmall, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {recipe.description}
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // List view (existing implementation with animations)
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          commonStyles.card, 
          { 
            marginBottom: spacing.md,
            borderRadius: borderRadius.xl,
            elevation: 2,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          }
        ]}
      >
        <View style={commonStyles.row}>
          {/* Recipe Image Placeholder */}
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: colors.surfaceVariant,
            borderRadius: borderRadius.lg,
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
                <Animated.View>
                  <Icon name="heart" size={16} color={colors.error} />
                </Animated.View>
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
                  <Icon name="time-outline" size={12} color={colors.textSecondary} />
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
      </Pressable>
    </Animated.View>
  );
}
