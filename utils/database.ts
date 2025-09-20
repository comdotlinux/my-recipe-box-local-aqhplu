
import * as SQLite from 'expo-sqlite';
import { Recipe, RecipeImage, UserPreference, SchemaInfo } from '../types/Recipe';

const DATABASE_NAME = 'myrecipebox.db';
const CURRENT_SCHEMA_VERSION = 1;

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  console.log('Initializing database...');
  
  if (db) {
    return db;
  }

  try {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    console.log('Database opened successfully');
    
    await runMigrations(db);
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};

const runMigrations = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  console.log('Running database migrations...');
  
  try {
    // Check current schema version
    let currentVersion = 0;
    try {
      const result = await database.getFirstAsync<{ version: number }>('SELECT version FROM schema_info ORDER BY version DESC LIMIT 1');
      currentVersion = result?.version || 0;
    } catch (error) {
      console.log('Schema info table does not exist, starting from version 0');
    }

    console.log(`Current schema version: ${currentVersion}`);

    if (currentVersion < 1) {
      await migrateToV1(database);
    }

    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

const migrateToV1 = async (database: SQLite.SQLiteDatabase): Promise<void> => {
  console.log('Migrating to schema version 1...');
  
  await database.execAsync(`
    -- Version tracking
    CREATE TABLE IF NOT EXISTS schema_info (
      version INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL,
      app_version TEXT
    );

    -- Recipes table
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      ingredients TEXT,
      instructions TEXT,
      source_url TEXT,
      servings INTEGER,
      prep_time INTEGER,
      cook_time INTEGER,
      difficulty TEXT,
      cuisine TEXT,
      tags TEXT,
      rating INTEGER,
      is_favorite BOOLEAN DEFAULT 0,
      notes TEXT,
      created_at INTEGER DEFAULT (strftime('%s','now')),
      modified_at INTEGER DEFAULT (strftime('%s','now'))
    );

    -- Recipe images table
    CREATE TABLE IF NOT EXISTS recipe_images (
      id TEXT PRIMARY KEY,
      recipe_id TEXT,
      image_path TEXT,
      thumbnail_path TEXT,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
    );

    -- User preferences table
    CREATE TABLE IF NOT EXISTS user_preferences (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    -- Full-text search virtual table
    CREATE VIRTUAL TABLE IF NOT EXISTS recipes_fts USING fts5(
      title, description, ingredients, instructions,
      content=recipes
    );

    -- Triggers to keep FTS table in sync
    CREATE TRIGGER IF NOT EXISTS recipes_fts_insert AFTER INSERT ON recipes BEGIN
      INSERT INTO recipes_fts(rowid, title, description, ingredients, instructions)
      VALUES (new.rowid, new.title, new.description, new.ingredients, new.instructions);
    END;

    CREATE TRIGGER IF NOT EXISTS recipes_fts_delete AFTER DELETE ON recipes BEGIN
      DELETE FROM recipes_fts WHERE rowid = old.rowid;
    END;

    CREATE TRIGGER IF NOT EXISTS recipes_fts_update AFTER UPDATE ON recipes BEGIN
      DELETE FROM recipes_fts WHERE rowid = old.rowid;
      INSERT INTO recipes_fts(rowid, title, description, ingredients, instructions)
      VALUES (new.rowid, new.title, new.description, new.ingredients, new.instructions);
    END;

    -- Insert schema version
    INSERT OR REPLACE INTO schema_info (version, applied_at, app_version)
    VALUES (1, strftime('%s','now'), '1.0.0');
  `);

  console.log('Schema version 1 migration completed');
};

// Recipe CRUD operations
export const createRecipe = async (recipe: Omit<Recipe, 'id' | 'created_at' | 'modified_at'>): Promise<string> => {
  const database = await initDatabase();
  const id = generateId();
  const now = Math.floor(Date.now() / 1000);
  
  console.log('Creating recipe:', recipe.title);
  
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

  console.log('Recipe created with ID:', id);
  return id;
};

export const getRecipe = async (id: string): Promise<Recipe | null> => {
  const database = await initDatabase();
  
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
};

export const getAllRecipes = async (): Promise<Recipe[]> => {
  const database = await initDatabase();
  
  const results = await database.getAllAsync<any>(
    'SELECT * FROM recipes ORDER BY modified_at DESC'
  );

  return results.map(result => ({
    ...result,
    tags: result.tags ? JSON.parse(result.tags) : [],
    is_favorite: Boolean(result.is_favorite),
  }));
};

export const updateRecipe = async (id: string, updates: Partial<Recipe>): Promise<void> => {
  const database = await initDatabase();
  const now = Math.floor(Date.now() / 1000);
  
  console.log('Updating recipe:', id);
  
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
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const database = await initDatabase();
  
  console.log('Deleting recipe:', id);
  
  await database.runAsync('DELETE FROM recipes WHERE id = ?', [id]);
};

export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  const database = await initDatabase();
  
  console.log('Searching recipes for:', query);
  
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
};

export const getFavoriteRecipes = async (): Promise<Recipe[]> => {
  const database = await initDatabase();
  
  const results = await database.getAllAsync<any>(
    'SELECT * FROM recipes WHERE is_favorite = 1 ORDER BY modified_at DESC'
  );

  return results.map(result => ({
    ...result,
    tags: result.tags ? JSON.parse(result.tags) : [],
    is_favorite: Boolean(result.is_favorite),
  }));
};

export const getRecentRecipes = async (limit: number = 10): Promise<Recipe[]> => {
  const database = await initDatabase();
  
  const results = await database.getAllAsync<any>(
    'SELECT * FROM recipes ORDER BY created_at DESC LIMIT ?',
    [limit]
  );

  return results.map(result => ({
    ...result,
    tags: result.tags ? JSON.parse(result.tags) : [],
    is_favorite: Boolean(result.is_favorite),
  }));
};

// User preferences
export const getUserPreference = async (key: string): Promise<string | null> => {
  const database = await initDatabase();
  
  const result = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM user_preferences WHERE key = ?',
    [key]
  );

  return result?.value || null;
};

export const setUserPreference = async (key: string, value: string): Promise<void> => {
  const database = await initDatabase();
  
  await database.runAsync(
    'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
    [key, value]
  );
};

// Utility function to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
