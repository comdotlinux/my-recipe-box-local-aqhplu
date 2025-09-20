
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { commonStyles, colors, typography, spacing } from '../../styles/commonStyles';
import { RootState, AppDispatch } from '../../store';
import { loadFavorites, loadRecentRecipes } from '../../store/slices/recipesSlice';
import RecipeCard from '../../components/RecipeCard';
import Icon from '../../components/Icon';

export default function CollectionsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { favorites, recentRecipes, loading } = useSelector((state: RootState) => state.recipes);

  useEffect(() => {
    console.log('CollectionsScreen mounted, loading collections...');
    dispatch(loadFavorites());
    dispatch(loadRecentRecipes(10));
  }, [dispatch]);

  const handleRefresh = () => {
    console.log('Refreshing collections...');
    dispatch(loadFavorites());
    dispatch(loadRecentRecipes(10));
  };

  const navigateToRecipe = (id: string) => {
    console.log('Navigating to recipe:', id);
    router.push(`/recipe/${id}`);
  };

  const collections = [
    {
      id: 'favorites',
      title: 'Favorites',
      icon: 'heart',
      count: favorites.length,
      recipes: favorites.slice(0, 3),
      color: colors.error,
    },
    {
      id: 'recent',
      title: 'Recently Added',
      icon: 'time',
      count: recentRecipes.length,
      recipes: recentRecipes.slice(0, 3),
      color: colors.primary,
    },
    {
      id: 'quick',
      title: 'Quick Recipes',
      icon: 'flash',
      count: recentRecipes.filter(r => (r.prep_time || 0) + (r.cook_time || 0) <= 30).length,
      recipes: recentRecipes.filter(r => (r.prep_time || 0) + (r.cook_time || 0) <= 30).slice(0, 3),
      color: colors.success,
    },
  ];

  const renderCollectionCard = (collection: typeof collections[0]) => (
    <View key={collection.id} style={[commonStyles.card, { marginBottom: spacing.lg }]}>
      <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
        <View style={commonStyles.row}>
          <Icon name={collection.icon as any} size={20} color={collection.color} />
          <Text style={[typography.titleMedium, { marginLeft: spacing.sm }]}>
            {collection.title}
          </Text>
        </View>
        <View style={[commonStyles.row, { alignItems: 'center' }]}>
          <Text style={[typography.labelMedium, { color: colors.textSecondary, marginRight: spacing.sm }]}>
            {collection.count} recipes
          </Text>
          <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
        </View>
      </View>

      {collection.recipes.length === 0 ? (
        <View style={[commonStyles.centerContent, { paddingVertical: spacing.lg }]}>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            No recipes in this collection yet
          </Text>
        </View>
      ) : (
        <View>
          {collection.recipes.map((recipe, index) => (
            <View key={recipe.id} style={{ marginBottom: index < collection.recipes.length - 1 ? spacing.sm : 0 }}>
              <TouchableOpacity
                style={[commonStyles.row, { paddingVertical: spacing.sm }]}
                onPress={() => navigateToRecipe(recipe.id)}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  backgroundColor: colors.surfaceVariant,
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.md,
                }}>
                  <Icon name="restaurant" size={16} color={colors.textSecondary} />
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={typography.bodyMedium} numberOfLines={1}>
                    {recipe.title}
                  </Text>
                  {recipe.description && (
                    <Text
                      style={[typography.bodySmall, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {recipe.description}
                    </Text>
                  )}
                </View>
                
                <Icon name="chevron-forward" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
          
          {collection.count > 3 && (
            <TouchableOpacity
              style={[commonStyles.row, { 
                justifyContent: 'center', 
                paddingVertical: spacing.sm,
                marginTop: spacing.sm,
              }]}
              onPress={() => {
                // TODO: Navigate to full collection view
                console.log('View all in collection:', collection.id);
              }}
            >
              <Text style={[typography.labelMedium, { color: colors.primary }]}>
                View all {collection.count} recipes
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={commonStyles.container}
        contentContainerStyle={{ padding: spacing.md }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[typography.headlineMedium, { marginBottom: spacing.xs }]}>
            Collections
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            Organize your recipes into smart collections
          </Text>
        </View>

        {/* Collections */}
        {collections.map(renderCollectionCard)}

        {/* Create Custom Collection */}
        <TouchableOpacity
          style={[commonStyles.card, { 
            alignItems: 'center', 
            paddingVertical: spacing.xl,
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: colors.outline,
            backgroundColor: 'transparent',
          }]}
          onPress={() => {
            // TODO: Implement custom collection creation
            console.log('Create custom collection');
          }}
        >
          <Icon name="add-circle-outline" size={32} color={colors.textSecondary} />
          <Text style={[typography.titleMedium, { 
            color: colors.textSecondary, 
            marginTop: spacing.sm 
          }]}>
            Create Custom Collection
          </Text>
          <Text style={[typography.bodySmall, { 
            color: colors.textSecondary, 
            textAlign: 'center',
            marginTop: spacing.xs 
          }]}>
            Group recipes by meal type, occasion, or any category you like
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
