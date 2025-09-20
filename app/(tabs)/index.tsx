
import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import { commonStyles, colors, typography, spacing } from '../../styles/commonStyles';
import { RootState, AppDispatch } from '../../store';
import { loadRecentRecipes, loadFavorites } from '../../store/slices/recipesSlice';
import Icon from '../../components/Icon';
import RecipeCard from '../../components/RecipeCard';

export default function HomeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { recentRecipes, favorites, loading } = useSelector((state: RootState) => state.recipes);

  useEffect(() => {
    console.log('Home screen mounted, loading data');
    dispatch(loadRecentRecipes(5));
    dispatch(loadFavorites());
  }, [dispatch]);

  const handleRefresh = () => {
    console.log('Refreshing home screen data');
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

  const navigateToScanner = () => {
    console.log('Navigating to QR scanner');
    router.push('/scanner');
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={{ padding: spacing.md, paddingBottom: spacing.sm }}>
          <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
            <Text style={typography.headlineMedium}>My Recipes</Text>
            
            <View style={commonStyles.row}>
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary + '20',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: spacing.sm,
                }}
                onPress={navigateToScanner}
              >
                <Icon name="qr-code" size={20} color={colors.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={navigateToAdd}
              >
                <Icon name="add" size={20} color={colors.background} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
        >
          {/* Quick Stats */}
          <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
            <View style={[commonStyles.row, { gap: spacing.md }]}>
              <View style={[commonStyles.card, { flex: 1, alignItems: 'center' }]}>
                <Text style={[typography.headlineSmall, { color: colors.primary }]}>
                  {recentRecipes.length}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                  Total Recipes
                </Text>
              </View>
              
              <View style={[commonStyles.card, { flex: 1, alignItems: 'center' }]}>
                <Text style={[typography.headlineSmall, { color: colors.error }]}>
                  {favorites.length}
                </Text>
                <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                  Favorites
                </Text>
              </View>
            </View>
          </View>

          {/* Recent Recipes */}
          <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.lg }}>
            <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
              <Text style={typography.titleLarge}>Recent Recipes</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/browse')}>
                <Text style={[typography.labelMedium, { color: colors.primary }]}>
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            {recentRecipes.length > 0 ? (
              <View>
                {recentRecipes.slice(0, 3).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onPress={() => navigateToRecipe(recipe.id)}
                    showFavorite
                  />
                ))}
              </View>
            ) : (
              <View style={[commonStyles.card, { alignItems: 'center', padding: spacing.xl }]}>
                <Icon name="restaurant" size={48} color={colors.textSecondary} />
                <Text style={[typography.titleMedium, { 
                  marginTop: spacing.md, 
                  marginBottom: spacing.sm,
                  textAlign: 'center' 
                }]}>
                  No Recipes Yet
                </Text>
                <Text style={[typography.bodyMedium, { 
                  color: colors.textSecondary, 
                  textAlign: 'center',
                  marginBottom: spacing.lg 
                }]}>
                  Start building your recipe collection by adding your first recipe or scanning a QR code.
                </Text>
                <View style={[commonStyles.row, { gap: spacing.md }]}>
                  <TouchableOpacity
                    style={[commonStyles.card, { 
                      backgroundColor: colors.primary,
                      paddingHorizontal: spacing.lg 
                    }]}
                    onPress={navigateToAdd}
                  >
                    <Text style={[typography.labelMedium, { color: colors.background }]}>
                      Add Recipe
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[commonStyles.card, { 
                      backgroundColor: colors.surface,
                      borderColor: colors.outline,
                      borderWidth: 1,
                      paddingHorizontal: spacing.lg 
                    }]}
                    onPress={navigateToScanner}
                  >
                    <Text style={[typography.labelMedium, { color: colors.text }]}>
                      Scan QR Code
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Favorites */}
          {favorites.length > 0 && (
            <View style={{ paddingHorizontal: spacing.md }}>
              <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
                <Text style={typography.titleLarge}>Favorites</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/collections')}>
                  <Text style={[typography.labelMedium, { color: colors.primary }]}>
                    View All
                  </Text>
                </TouchableOpacity>
              </View>

              <View>
                {favorites.slice(0, 2).map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onPress={() => navigateToRecipe(recipe.id)}
                    showFavorite
                  />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
