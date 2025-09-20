
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
export const loadAllRecipes = createAsyncThunk(
  'recipes/loadAll',
  async () => {
    console.log('Loading all recipes...');
    return await db.getAllRecipes();
  }
);

export const loadFavorites = createAsyncThunk(
  'recipes/loadFavorites',
  async () => {
    console.log('Loading favorite recipes...');
    return await db.getFavoriteRecipes();
  }
);

export const loadRecentRecipes = createAsyncThunk(
  'recipes/loadRecent',
  async (limit: number = 10) => {
    console.log('Loading recent recipes...');
    return await db.getRecentRecipes(limit);
  }
);

export const loadRecipe = createAsyncThunk(
  'recipes/loadOne',
  async (id: string) => {
    console.log('Loading recipe:', id);
    return await db.getRecipe(id);
  }
);

export const createRecipe = createAsyncThunk(
  'recipes/create',
  async (recipeData: Omit<Recipe, 'id' | 'created_at' | 'modified_at'>) => {
    console.log('Creating new recipe...');
    const id = await db.createRecipe(recipeData);
    return await db.getRecipe(id);
  }
);

export const updateRecipe = createAsyncThunk(
  'recipes/update',
  async ({ id, updates }: { id: string; updates: Partial<Recipe> }) => {
    console.log('Updating recipe:', id);
    await db.updateRecipe(id, updates);
    return await db.getRecipe(id);
  }
);

export const deleteRecipe = createAsyncThunk(
  'recipes/delete',
  async (id: string) => {
    console.log('Deleting recipe:', id);
    await db.deleteRecipe(id);
    return id;
  }
);

export const searchRecipes = createAsyncThunk(
  'recipes/search',
  async (query: string) => {
    console.log('Searching recipes:', query);
    if (!query.trim()) {
      return [];
    }
    return await db.searchRecipes(query);
  }
);

export const toggleFavorite = createAsyncThunk(
  'recipes/toggleFavorite',
  async (recipe: Recipe) => {
    console.log('Toggling favorite for recipe:', recipe.id);
    const updates = { is_favorite: !recipe.is_favorite };
    await db.updateRecipe(recipe.id, updates);
    return await db.getRecipe(recipe.id);
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
      
      // Load favorites
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.favorites = action.payload;
      })
      
      // Load recent recipes
      .addCase(loadRecentRecipes.fulfilled, (state, action) => {
        state.recentRecipes = action.payload;
      })
      
      // Load single recipe
      .addCase(loadRecipe.fulfilled, (state, action) => {
        state.currentRecipe = action.payload;
      })
      
      // Create recipe
      .addCase(createRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRecipe.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.recipes.unshift(action.payload);
          state.recentRecipes.unshift(action.payload);
        }
      })
      .addCase(createRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create recipe';
      })
      
      // Update recipe
      .addCase(updateRecipe.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.recipes.findIndex(r => r.id === action.payload!.id);
          if (index !== -1) {
            state.recipes[index] = action.payload;
          }
          if (state.currentRecipe?.id === action.payload.id) {
            state.currentRecipe = action.payload;
          }
        }
      })
      
      // Delete recipe
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        const id = action.payload;
        state.recipes = state.recipes.filter(r => r.id !== id);
        state.favorites = state.favorites.filter(r => r.id !== id);
        state.recentRecipes = state.recentRecipes.filter(r => r.id !== id);
        if (state.currentRecipe?.id === id) {
          state.currentRecipe = null;
        }
      })
      
      // Search recipes
      .addCase(searchRecipes.fulfilled, (state, action) => {
        state.searchResults = action.payload;
      })
      
      // Toggle favorite
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        if (action.payload) {
          const recipe = action.payload;
          const index = state.recipes.findIndex(r => r.id === recipe.id);
          if (index !== -1) {
            state.recipes[index] = recipe;
          }
          if (recipe.is_favorite) {
            state.favorites.push(recipe);
          } else {
            state.favorites = state.favorites.filter(r => r.id !== recipe.id);
          }
          if (state.currentRecipe?.id === recipe.id) {
            state.currentRecipe = recipe;
          }
        }
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
