
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import { Recipe, RecipeImage, UserPreference, SchemaInfo } from '../types/Recipe';
import { MigrationSystem } from './migrationSystem';

const DATABASE_NAME = 'myrecipebox.db';
const CURRENT_SCHEMA_VERSION = 1;

// Platform-specific database implementation
let db: any = null;
let isWebFallback = false;

export const initDatabase = async (): Promise<any> => {
  console.log('Initializing database...');
  
  if (db) {
    return db;
  }

  try {
    if (Platform.OS === 'web') {
      // Use AsyncStorage fallback for web to avoid WASM issues
      console.log('Using AsyncStorage fallback for web platform');
      isWebFallback = true;
      await initWebDatabase();
      db = { isWebFallback: true };
    } else {
      // Use SQLite for native platforms
      db = await SQLite.openDatabaseAsync(DATABASE_NAME);
      console.log('Database opened successfully');
      await runMigrations(db);
    }
    
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    // Fallback to AsyncStorage even on native if SQLite fails
    console.log('Falling back to AsyncStorage due to SQLite error');
    isWebFallback = true;
    await initWebDatabase();
    db = { isWebFallback: true };
    return db;
  }
};

const initWebDatabase = async (): Promise<void> => {
  console.log('Initializing web database with AsyncStorage...');
  
  // Initialize empty collections if they don't exist
  const recipes = await AsyncStorage.getItem('recipes');
  if (!recipes) {
    await AsyncStorage.setItem('recipes', JSON.stringify([]));
  }
  
  const preferences = await AsyncStorage.getItem('user_preferences');
  if (!preferences) {
    await AsyncStorage.setItem('user_preferences', JSON.stringify({}));
  }
  
  // Set schema version
  await AsyncStorage.setItem('schema_version', '1');
  console.log('Web database initialized');
};

const runMigrations = async (database: any): Promise<void> => {
  console.log('Running database migrations...');
  
  try {
    const migrationSystem = new MigrationSystem(database);
    const results = await migrationSystem.runMigrations();
    
    // Check if any migrations failed
    const failedMigrations = results.filter(r => !r.success);
    if (failedMigrations.length > 0) {
      throw new Error(`${failedMigrations.length} migrations failed`);
    }

    // Validate schema after migrations
    const validation = await migrationSystem.validateSchema();
    if (!validation.valid) {
      console.warn('Schema validation warnings:', validation.errors);
    }

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

// Legacy migration function - now handled by MigrationSystem
// Kept for reference and potential rollback scenarios
const migrateToV1 = async (database: any): Promise<void> => {
  console.log('Legacy migration function - should not be called directly');
  console.log('Migrations are now handled by MigrationSystem class');
};

// Web-specific AsyncStorage operations
const getRecipesFromStorage = async (): Promise<Recipe[]> => {
  const recipesJson = await AsyncStorage.getItem('recipes');
  return recipesJson ? JSON.parse(recipesJson) : [];
};

const saveRecipesToStorage = async (recipes: Recipe[]): Promise<void> => {
  await AsyncStorage.setItem('recipes', JSON.stringify(recipes));
};

// Recipe CRUD operations
export const createRecipe = async (recipe: Omit<Recipe, 'id' | 'created_at' | 'modified_at'>): Promise<string> => {
  const database = await initDatabase();
  const id = generateId();
  const now = Math.floor(Date.now() / 1000);
  
  console.log('Creating recipe:', recipe.title);
  
  if (isWebFallback) {
    // AsyncStorage implementation
    const recipes = await getRecipesFromStorage();
    const newRecipe: Recipe = {
      ...recipe,
      id,
      created_at: now,
      modified_at: now,
      tags: recipe.tags || [],
      is_favorite: recipe.is_favorite || false,
    };
    recipes.push(newRecipe);
    await saveRecipesToStorage(recipes);
  } else {
    // SQLite implementation
    await database.runAsync(
      `INSERT INTO recipes (
        id, title, description, ingredients, instructions, source_url,
        servings, prep_time, cook_time, difficulty, cuisine, tags,
        rating, is_favorite, notes, created_at, modified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, recipe.title, recipe.description, recipe.ingredients, recipe.instructions,
        recipe.source_url, recipe.servings, recipe.prep_time, recipe.cook_time,
        recipe.difficulty, recipe.cuisine, JSON.stringify(recipe.tags || []),
        recipe.rating, recipe.is_favorite ? 1 : 0, recipe.notes, now, now
      ]
    );
  }

  console.log('Recipe created with ID:', id);
  return id;
};

export const getRecipe = async (id: string): Promise<Recipe | null> => {
  const database = await initDatabase();
  
  if (isWebFallback) {
    // AsyncStorage implementation
    const recipes = await getRecipesFromStorage();
    return recipes.find(recipe => recipe.id === id) || null;
  } else {
    // SQLite implementation
    const result = await database.getFirstAsync<any>(
      'SELECT * FROM recipes WHERE id = ?',
      [id]
    );

    if (!result) {
      return null;
    }

    return {
      ...result,
      tags: result.tags ? JSON.parse(result.tags) : [],
      is_favorite: Boolean(result.is_favorite),
    };
  }
};

export const getAllRecipes = async (): Promise<Recipe[]> => {
  const database = await initDatabase();
  
  if (isWebFallback) {
    // AsyncStorage implementation
    const recipes = await getRecipesFromStorage();
    return recipes.sort((a, b) => b.modified_at - a.modified_at);
  } else {
    // SQLite implementation
    const results = await database.getAllAsync<any>(
      'SELECT * FROM recipes ORDER BY modified_at DESC'
    );

    return results.map(result => ({
      ...result,
      tags: result.tags ? JSON.parse(result.tags) : [],
      is_favorite: Boolean(result.is_favorite),
    }));
  }
};

export const updateRecipe = async (id: string, updates: Partial<Recipe>): Promise<void> => {
  const database = await initDatabase();
  const now = Math.floor(Date.now() / 1000);
  
  console.log('Updating recipe:', id);
  
  if (isWebFallback) {
    // AsyncStorage implementation
    const recipes = await getRecipesFromStorage();
    const index = recipes.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
      recipes[index] = {
        ...recipes[index],
        ...updates,
        modified_at: now,
      };
      await saveRecipesToStorage(recipes);
    }
  } else {
    // SQLite implementation
    const fields = [];
    const values = [];
    
    Object.entries(updates).forEach(([key, value]) => {
      if (key !== 'id' && key !== 'created_at') {
        fields.push(`${key} = ?`);
        if (key === 'tags') {
          values.push(JSON.stringify(value));
        } else if (key === 'is_favorite') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    });
    
    fields.push('modified_at = ?');
    values.push(now);
    values.push(id);
    
    await database.runAsync(
      `UPDATE recipes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const database = await initDatabase();
  
  console.log('Deleting recipe:', id);
  
  if (isWebFallback) {
    // AsyncStorage implementation
    const recipes = await getRecipesFromStorage();
    const filteredRecipes = recipes.filter(recipe => recipe.id !== id);
    await saveRecipesToStorage(filteredRecipes);
  } else {
    // SQLite implementation
    await database.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
  }
};

export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  const database = await initDatabase();
  
  console.log('Searching recipes for:', query);
  
  if (isWebFallback) {
    // AsyncStorage implementation - simple text search
    const recipes = await getRecipesFromStorage();
    const searchTerm = query.toLowerCase();
    return recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm) ||
      recipe.description?.toLowerCase().includes(searchTerm) ||
      recipe.ingredients?.toLowerCase().includes(searchTerm) ||
      recipe.instructions?.toLowerCase().includes(searchTerm)
    );
  } else {
    // SQLite implementation with FTS
    const results = await database.getAllAsync<any>(
      `SELECT recipes.* FROM recipes
       JOIN recipes_fts ON recipes.rowid = recipes_fts.rowid
       WHERE recipes_fts MATCH ?
       ORDER BY rank`,
      [query]
    );

    return results.map(result => ({
      ...result,
      tags: result.tags ? JSON.parse(result.tags) : [],
      is_favorite: Boolean(result.is_favorite),
    }));
  }
};

export const getFavoriteRecipes = async (): Promise<Recipe[]> => {
  const database = await initDatabase();
  
  if (isWebFallback) {
    // AsyncStorage implementation
    const recipes = await getRecipesFromStorage();
    return recipes
      .filter(recipe => recipe.is_favorite)
      .sort((a, b) => b.modified_at - a.modified_at);
  } else {
    // SQLite implementation
    const results = await database.getAllAsync<any>(
      'SELECT * FROM recipes WHERE is_favorite = 1 ORDER BY modified_at DESC'
    );

    return results.map(result => ({
      ...result,
      tags: result.tags ? JSON.parse(result.tags) : [],
      is_favorite: Boolean(result.is_favorite),
    }));
  }
};

export const getRecentRecipes = async (limit: number = 10): Promise<Recipe[]> => {
  const database = await initDatabase();
  
  if (isWebFallback) {
    // AsyncStorage implementation
    const recipes = await getRecipesFromStorage();
    return recipes
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit);
  } else {
    // SQLite implementation
    const results = await database.getAllAsync<any>(
      'SELECT * FROM recipes ORDER BY created_at DESC LIMIT ?',
      [limit]
    );

    return results.map(result => ({
      ...result,
      tags: result.tags ? JSON.parse(result.tags) : [],
      is_favorite: Boolean(result.is_favorite),
    }));
  }
};

// User preferences
export const getUserPreference = async (key: string): Promise<string | null> => {
  const database = await initDatabase();
  
  if (isWebFallback) {
    // AsyncStorage implementation
    const preferencesJson = await AsyncStorage.getItem('user_preferences');
    const preferences = preferencesJson ? JSON.parse(preferencesJson) : {};
    return preferences[key] || null;
  } else {
    // SQLite implementation
    const result = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM user_preferences WHERE key = ?',
      [key]
    );

    return result?.value || null;
  }
};

export const setUserPreference = async (key: string, value: string): Promise<void> => {
  const database = await initDatabase();
  
  if (isWebFallback) {
    // AsyncStorage implementation
    const preferencesJson = await AsyncStorage.getItem('user_preferences');
    const preferences = preferencesJson ? JSON.parse(preferencesJson) : {};
    preferences[key] = value;
    await AsyncStorage.setItem('user_preferences', JSON.stringify(preferences));
  } else {
    // SQLite implementation
    await database.runAsync(
      'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
      [key, value]
    );
  }
};

// Utility function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Migration utilities for debugging and monitoring
export const getMigrationInfo = async (): Promise<{
  currentVersion: number;
  latestVersion: number;
  history: any[];
  isValid: boolean;
  errors: string[];
}> => {
  const database = await initDatabase();
  
  if (isWebFallback) {
    return {
      currentVersion: 1,
      latestVersion: 1,
      history: [],
      isValid: true,
      errors: []
    };
  }

  const migrationSystem = new MigrationSystem(database);
  const currentVersion = await migrationSystem.getCurrentVersion();
  const latestVersion = await migrationSystem.getLatestVersion();
  const history = await migrationSystem.getMigrationHistory();
  const validation = await migrationSystem.validateSchema();

  return {
    currentVersion,
    latestVersion,
    history,
    isValid: validation.valid,
    errors: validation.errors
  };
};

export const validateDatabaseSchema = async (): Promise<{ valid: boolean; errors: string[] }> => {
  const database = await initDatabase();
  
  if (isWebFallback) {
    return { valid: true, errors: [] };
  }

  const migrationSystem = new MigrationSystem(database);
  return await migrationSystem.validateSchema();
};

export const resetDatabase = async (): Promise<void> => {
  console.log('Resetting database...');
  
  if (isWebFallback) {
    // Clear AsyncStorage
    await AsyncStorage.multiRemove(['recipes', 'user_preferences', 'schema_version']);
    await initWebDatabase();
  } else {
    // For SQLite, we would need to close and delete the database file
    // This is more complex and should be done carefully
    throw new Error('Database reset for SQLite not implemented - use app data clearing instead');
  }
  
  // Reset the database instance
  db = null;
  isWebFallback = false;
  
  console.log('Database reset completed');
};
