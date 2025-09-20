
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { commonStyles, colors, typography, spacing } from '../../styles/commonStyles';
import { RootState, AppDispatch } from '../../store';
import { loadAllRecipes, searchRecipes, setSearchQuery } from '../../store/slices/recipesSlice';
import { setViewMode } from '../../store/slices/uiSlice';
import RecipeCard from '../../components/RecipeCard';
import Icon from '../../components/Icon';
import { router } from 'expo-router';

export default function BrowseScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { recipes, searchResults, searchQuery, loading } = useSelector((state: RootState) => state.recipes);
  const { viewMode } = useSelector((state: RootState) => state.ui);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  useEffect(() => {
    console.log('BrowseScreen mounted, loading recipes...');
    dispatch(loadAllRecipes());
  }, [dispatch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localSearchQuery.trim()) {
        console.log('Searching for:', localSearchQuery);
        dispatch(setSearchQuery(localSearchQuery));
        dispatch(searchRecipes(localSearchQuery));
      } else {
        dispatch(setSearchQuery(''));
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, dispatch]);

  const handleRefresh = () => {
    console.log('Refreshing recipes...');
    dispatch(loadAllRecipes());
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    console.log('Switching view mode to:', newMode);
    dispatch(setViewMode(newMode));
  };

  const navigateToRecipe = (id: string) => {
    console.log('Navigating to recipe:', id);
    router.push(`/recipe/${id}`);
  };

  const displayRecipes = searchQuery ? searchResults : recipes;

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <View style={commonStyles.container}>
        {/* Header */}
        <View style={{ padding: spacing.md, paddingBottom: spacing.sm }}>
          <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
            <Text style={typography.headlineMedium}>Browse Recipes</Text>
            <TouchableOpacity onPress={toggleViewMode}>
              <Icon 
                name={viewMode === 'grid' ? 'list' : 'grid'} 
                size={24} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[commonStyles.searchBar, commonStyles.row]}>
            <Icon name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={{
                flex: 1,
                marginLeft: spacing.sm,
                fontSize: 16,
                color: colors.text,
              }}
              placeholder="Search recipes..."
              placeholderTextColor={colors.textSecondary}
              value={localSearchQuery}
              onChangeText={setLocalSearchQuery}
            />
            {localSearchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setLocalSearchQuery('')}>
                <Icon name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Results */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: spacing.md }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
        >
          {/* Search Results Header */}
          {searchQuery && (
            <View style={{ marginBottom: spacing.md }}>
              <Text style={[typography.bodyMedium, { color: colors.textSecondary }]}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </Text>
            </View>
          )}

          {/* Recipe List */}
          {displayRecipes.length === 0 ? (
            <View style={[commonStyles.centerContent, { minHeight: 300 }]}>
              <Icon 
                name={searchQuery ? "search" : "restaurant"} 
                size={48} 
                color={colors.textSecondary} 
              />
              <Text style={[typography.titleMedium, { 
                color: colors.textSecondary, 
                marginTop: spacing.md,
                textAlign: 'center' 
              }]}>
                {searchQuery 
                  ? `No recipes found for "${searchQuery}"`
                  : "No recipes yet"
                }
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={[commonStyles.button, { marginTop: spacing.lg }]}
                  onPress={() => router.push('/(tabs)/add')}
                >
                  <Text style={commonStyles.buttonText}>Add Your First Recipe</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            displayRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onPress={() => navigateToRecipe(recipe.id)}
              />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
