
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Recipe, SearchFilters, SortOption, SortOrder } from '../../types/Recipe';
import * as db from '../../utils/database';

interface RecipesState {
  recipes: Recipe[];
  favorites: Recipe[];
  recentRecipes: Recipe[];
  searchResults: Recipe[];
  currentRecipe: Recipe | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: SearchFilters;
  sortBy: SortOption;
  sortOrder: SortOrder;
}

const initialState: RecipesState = {
  recipes: [],
  favorites: [],
  recentRecipes: [],
  searchResults: [],
  currentRecipe: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
  sortBy: 'date',
  sortOrder: 'desc',
};

// Async thunks
export const createRecipe = createAsyncThunk(
  'recipes/create',
  async (recipe: Omit<Recipe, 'id' | 'created_at' | 'modified_at'>) => {
    console.log('Creating recipe:', recipe.title);
    const id = await db.createRecipe(recipe);
    const createdRecipe = await db.getRecipe(id);
    if (!createdRecipe) {
      throw new Error('Failed to retrieve created recipe');
    }
    return createdRecipe;
  }
);

export const loadRecipe = createAsyncThunk(
  'recipes/loadOne',
  async (id: string) => {
    console.log('Loading recipe:', id);
    const recipe = await db.getRecipe(id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }
    return recipe;
  }
);

export const loadAllRecipes = createAsyncThunk(
  'recipes/loadAll',
  async () => {
    console.log('Loading all recipes');
    return await db.getAllRecipes();
  }
);

export const updateRecipe = createAsyncThunk(
  'recipes/update',
  async ({ id, updates }: { id: string; updates: Partial<Recipe> }) => {
    console.log('Updating recipe:', id);
    await db.updateRecipe(id, updates);
    const updatedRecipe = await db.getRecipe(id);
    if (!updatedRecipe) {
      throw new Error('Failed to retrieve updated recipe');
    }
    return updatedRecipe;
  }
);

export const deleteRecipe = createAsyncThunk(
  'recipes/delete',
  async (id: string) => {
    console.log('Deleting recipe from database:', id);
    
    // First verify the recipe exists
    const existingRecipe = await db.getRecipe(id);
    if (!existingRecipe) {
      throw new Error('Recipe not found');
    }
    
    // Delete from database
    await db.deleteRecipe(id);
    
    // Verify deletion was successful
    const deletedRecipe = await db.getRecipe(id);
    if (deletedRecipe) {
      throw new Error('Recipe deletion failed - recipe still exists');
    }
    
    console.log('Recipe successfully deleted from database:', id);
    return id;
  }
);

export const searchRecipes = createAsyncThunk(
  'recipes/search',
  async (query: string) => {
    console.log('Searching recipes:', query);
    if (!query.trim()) {
      return await db.getAllRecipes();
    }
    return await db.searchRecipes(query);
  }
);

export const loadFavorites = createAsyncThunk(
  'recipes/loadFavorites',
  async () => {
    console.log('Loading favorite recipes');
    return await db.getFavoriteRecipes();
  }
);

export const loadRecentRecipes = createAsyncThunk(
  'recipes/loadRecent',
  async (limit: number = 10) => {
    console.log('Loading recent recipes');
    return await db.getRecentRecipes(limit);
  }
);

export const toggleFavorite = createAsyncThunk(
  'recipes/toggleFavorite',
  async (recipe: Recipe) => {
    console.log('Toggling favorite for recipe:', recipe.id);
    const newFavoriteStatus = !recipe.is_favorite;
    await db.updateRecipe(recipe.id, { is_favorite: newFavoriteStatus });
    const updatedRecipe = await db.getRecipe(recipe.id);
    if (!updatedRecipe) {
      throw new Error('Failed to retrieve updated recipe');
    }
    return updatedRecipe;
  }
);

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    setSortBy: (state, action: PayloadAction<SortOption>) => {
      state.sortBy = action.payload;
    },
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create recipe
      .addCase(createRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes.unshift(action.payload);
        state.recentRecipes.unshift(action.payload);
        // Keep recent recipes limited
        if (state.recentRecipes.length > 10) {
          state.recentRecipes = state.recentRecipes.slice(0, 10);
        }
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create recipe';
      })

      // Load single recipe
      .addCase(loadRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecipe = action.payload;
      })
      .addCase(loadRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load recipe';
      })

      // Load all recipes
      .addCase(loadAllRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadAllRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
      })
      .addCase(loadAllRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load recipes';
      })

      // Update recipe
      .addCase(updateRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.recipes.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.recipes[index] = action.payload;
        }
        if (state.currentRecipe?.id === action.payload.id) {
          state.currentRecipe = action.payload;
        }
        // Update in favorites if present
        const favIndex = state.favorites.findIndex(r => r.id === action.payload.id);
        if (favIndex !== -1) {
          if (action.payload.is_favorite) {
            state.favorites[favIndex] = action.payload;
          } else {
            state.favorites.splice(favIndex, 1);
          }
        } else if (action.payload.is_favorite) {
          state.favorites.unshift(action.payload);
        }
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update recipe';
      })

      // Delete recipe
      .addCase(deleteRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Delete recipe pending - setting loading state');
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        console.log('Delete recipe fulfilled - removing from state:', action.payload);
        state.loading = false;
        
        // Remove from all arrays
        state.recipes = state.recipes.filter(r => r.id !== action.payload);
        state.favorites = state.favorites.filter(r => r.id !== action.payload);
        state.recentRecipes = state.recentRecipes.filter(r => r.id !== action.payload);
        state.searchResults = state.searchResults.filter(r => r.id !== action.payload);
        
        // Clear current recipe if it's the deleted one
        if (state.currentRecipe?.id === action.payload) {
          state.currentRecipe = null;
        }
        
        console.log('Recipe removed from Redux state successfully');
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        console.error('Delete recipe rejected:', action.error);
        state.loading = false;
        state.error = action.error.message || 'Failed to delete recipe';
      })

      // Search recipes
      .addCase(searchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search recipes';
      })

      // Load favorites
      .addCase(loadFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(loadFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load favorites';
      })

      // Load recent recipes
      .addCase(loadRecentRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadRecentRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recentRecipes = action.payload;
      })
      .addCase(loadRecentRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load recent recipes';
      })

      // Toggle favorite
      .addCase(toggleFavorite.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const recipe = action.payload;
        
        // Update in main recipes list
        const index = state.recipes.findIndex(r => r.id === recipe.id);
        if (index !== -1) {
          state.recipes[index] = recipe;
        }
        
        // Update current recipe if it's the same
        if (state.currentRecipe?.id === recipe.id) {
          state.currentRecipe = recipe;
        }
        
        // Update favorites list
        const favIndex = state.favorites.findIndex(r => r.id === recipe.id);
        if (recipe.is_favorite) {
          if (favIndex === -1) {
            state.favorites.unshift(recipe);
          } else {
            state.favorites[favIndex] = recipe;
          }
        } else {
          if (favIndex !== -1) {
            state.favorites.splice(favIndex, 1);
          }
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle favorite';
      });
  },
});

export const {
  setSearchQuery,
  setFilters,
  setSortBy,
  setSortOrder,
  clearError,
  clearCurrentRecipe,
} = recipesSlice.actions;

export default recipesSlice.reducer;
