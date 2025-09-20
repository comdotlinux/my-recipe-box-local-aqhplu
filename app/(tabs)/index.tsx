
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { commonStyles, colors, typography, spacing } from '../../styles/commonStyles';
import { RootState, AppDispatch } from '../../store';
import { loadRecentRecipes, loadFavorites } from '../../store/slices/recipesSlice';
import RecipeCard from '../../components/RecipeCard';
import Icon from '../../components/Icon';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { recentRecipes, favorites, loading } = useSelector((state: RootState) => state.recipes);

  useEffect(() => {
    console.log('HomeScreen mounted, loading data...');
    dispatch(loadRecentRecipes(5));
    dispatch(loadFavorites());
  }, [dispatch]);

  const handleRefresh = () => {
    console.log('Refreshing home screen data...');
    dispatch(loadRecentRecipes(5));
    dispatch(loadFavorites());
  };

  const navigateToRecipe = (id: string) => {
    console.log('Navigating to recipe:', id);
    router.push(`/recipe/${id}`);
  };

  const navigateToAdd = () => {
    console.log('Navigating to add recipe');
    router.push('/(tabs)/add');
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView
        style={commonStyles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={{ padding: spacing.md, paddingBottom: spacing.sm }}>
          <Text style={[typography.headlineMedium, { marginBottom: spacing.xs }]}>
            My Recipe Box
          </Text>
          <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
            Welcome back! Here are your latest recipes.
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: spacing.md,
          marginBottom: spacing.lg,
        }}>
          <View style={[commonStyles.card, { flex: 1, marginRight: spacing.sm, alignItems: 'center' }]}>
            <Text style={[typography.headlineSmall, { color: colors.primary }]}>
              {recentRecipes.length}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              Recent
            </Text>
          </View>
          <View style={[commonStyles.card, { flex: 1, marginLeft: spacing.sm, alignItems: 'center' }]}>
            <Text style={[typography.headlineSmall, { color: colors.primary }]}>
              {favorites.length}
            </Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
              Favorites
            </Text>
          </View>
        </View>

        {/* Recent Recipes */}
        <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
          <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
            <Text style={typography.titleLarge}>Recent Recipes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/browse')}>
              <Text style={[typography.labelLarge, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          {recentRecipes.length === 0 ? (
            <View style={[commonStyles.card, commonStyles.centerContent, { minHeight: 120 }]}>
              <Icon name="restaurant" size={32} color={colors.textSecondary} />
              <Text style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                No recipes yet
              </Text>
              <TouchableOpacity
                style={[commonStyles.button, { marginTop: spacing.md }]}
                onPress={navigateToAdd}
              >
                <Text style={commonStyles.buttonText}>Add Your First Recipe</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => navigateToRecipe(recipe.id)}
              />
            ))
          )}
        </View>

        {/* Favorites */}
        {favorites.length > 0 && (
          <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
            <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
              <Text style={typography.titleLarge}>Favorites</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/collections')}>
                <Text style={[typography.labelLarge, { color: colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            
            {favorites.slice(0, 3).map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => navigateToRecipe(recipe.id)}
              />
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.xl }}>
          <Text style={[typography.titleLarge, { marginBottom: spacing.md }]}>
            Quick Actions
          </Text>
          
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <TouchableOpacity
              style={[commonStyles.card, { flex: 1, alignItems: 'center', paddingVertical: spacing.lg }]}
              onPress={navigateToAdd}
            >
              <Icon name="camera" size={24} color={colors.primary} />
              <Text style={[typography.labelMedium, { marginTop: spacing.xs }]}>
                Photo Recipe
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[commonStyles.card, { flex: 1, alignItems: 'center', paddingVertical: spacing.lg }]}
              onPress={navigateToAdd}
            >
              <Icon name="link" size={24} color={colors.primary} />
              <Text style={[typography.labelMedium, { marginTop: spacing.xs }]}>
                From URL
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[commonStyles.card, { flex: 1, alignItems: 'center', paddingVertical: spacing.lg }]}
              onPress={navigateToAdd}
            >
              <Icon name="create" size={24} color={colors.primary} />
              <Text style={[typography.labelMedium, { marginTop: spacing.xs }]}>
                Manual Entry
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={commonStyles.fab}
        onPress={navigateToAdd}
      >
        <Icon name="add" size={24} color={colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
