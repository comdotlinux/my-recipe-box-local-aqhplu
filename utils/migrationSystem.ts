
import * as SQLite from 'expo-sqlite';

export interface MigrationResult {
  version: number;
  success: boolean;
  error?: string;
  executionTime: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface Migration {
  version: number;
  description: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down?: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

export class MigrationSystem {
  private db: SQLite.SQLiteDatabase;
  private migrations: Migration[];

  constructor(database: SQLite.SQLiteDatabase) {
    this.db = database;
    this.migrations = this.getMigrations();
  }

  private getMigrations(): Migration[] {
    return [
      {
        version: 1,
        description: 'Initial schema - Create recipes, recipe_images, user_preferences, and schema_info tables',
        up: async (db: SQLite.SQLiteDatabase) => {
          console.log('Running migration v1: Initial schema');
          
          // Create schema_info table first
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS schema_info (
              version INTEGER PRIMARY KEY,
              applied_at INTEGER NOT NULL,
              app_version TEXT
            );
          `);

          // Create recipes table
          await db.execAsync(`
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
          `);

          // Create recipe_images table
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS recipe_images (
              id TEXT PRIMARY KEY,
              recipe_id TEXT,
              image_path TEXT,
              thumbnail_path TEXT,
              position INTEGER DEFAULT 0,
              FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
            );
          `);

          // Create user_preferences table
          await db.execAsync(`
            CREATE TABLE IF NOT EXISTS user_preferences (
              key TEXT PRIMARY KEY,
              value TEXT
            );
          `);

          // Create full-text search virtual table
          await db.execAsync(`
            CREATE VIRTUAL TABLE IF NOT EXISTS recipes_fts USING fts5(
              title, description, ingredients, instructions,
              content=recipes,
              content_rowid=rowid
            );
          `);

          // Create triggers to keep FTS table in sync
          await db.execAsync(`
            CREATE TRIGGER IF NOT EXISTS recipes_fts_insert AFTER INSERT ON recipes BEGIN
              INSERT INTO recipes_fts(rowid, title, description, ingredients, instructions)
              VALUES (new.rowid, new.title, new.description, new.ingredients, new.instructions);
            END;
          `);

          await db.execAsync(`
            CREATE TRIGGER IF NOT EXISTS recipes_fts_delete AFTER DELETE ON recipes BEGIN
              INSERT INTO recipes_fts(recipes_fts, rowid, title, description, ingredients, instructions)
              VALUES('delete', old.rowid, old.title, old.description, old.ingredients, old.instructions);
            END;
          `);

          await db.execAsync(`
            CREATE TRIGGER IF NOT EXISTS recipes_fts_update AFTER UPDATE ON recipes BEGIN
              INSERT INTO recipes_fts(recipes_fts, rowid, title, description, ingredients, instructions)
              VALUES('delete', old.rowid, old.title, old.description, old.ingredients, old.instructions);
              INSERT INTO recipes_fts(rowid, title, description, ingredients, instructions)
              VALUES (new.rowid, new.title, new.description, new.ingredients, new.instructions);
            END;
          `);

          console.log('Migration v1 completed successfully');
        },
        down: async (db: SQLite.SQLiteDatabase) => {
          console.log('Rolling back migration v1');
          await db.execAsync('DROP TRIGGER IF EXISTS recipes_fts_update;');
          await db.execAsync('DROP TRIGGER IF EXISTS recipes_fts_delete;');
          await db.execAsync('DROP TRIGGER IF EXISTS recipes_fts_insert;');
          await db.execAsync('DROP TABLE IF EXISTS recipes_fts;');
          await db.execAsync('DROP TABLE IF EXISTS user_preferences;');
          await db.execAsync('DROP TABLE IF EXISTS recipe_images;');
          await db.execAsync('DROP TABLE IF EXISTS recipes;');
          await db.execAsync('DROP TABLE IF EXISTS schema_info;');
        }
      }
      // Future migrations can be added here
      // {
      //   version: 2,
      //   description: 'Add nutrition table',
      //   up: async (db: SQLite.SQLiteDatabase) => {
      //     await db.execAsync(`
      //       CREATE TABLE recipe_nutrition (
      //         recipe_id TEXT PRIMARY KEY,
      //         calories INTEGER,
      //         protein REAL,
      //         carbs REAL,
      //         fat REAL,
      //         fiber REAL,
      //         sugar REAL,
      //         sodium REAL,
      //         FOREIGN KEY (recipe_id) REFERENCES recipes (id) ON DELETE CASCADE
      //       );
      //     `);
      //   }
      // }
    ];
  }

  async runMigrations(): Promise<MigrationResult[]> {
    console.log('Starting migration process...');
    const results: MigrationResult[] = [];

    try {
      // Ensure schema_info table exists
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS schema_info (
          version INTEGER PRIMARY KEY,
          applied_at INTEGER NOT NULL,
          app_version TEXT
        );
      `);

      const currentVersion = await this.getCurrentVersion();
      const latestVersion = this.getLatestVersion();

      console.log(`Current schema version: ${currentVersion}, Latest: ${latestVersion}`);

      if (currentVersion >= latestVersion) {
        console.log('Database is up to date');
        return results;
      }

      // Run pending migrations
      for (const migration of this.migrations) {
        if (migration.version > currentVersion) {
          const startTime = Date.now();
          
          try {
            console.log(`Running migration ${migration.version}: ${migration.description}`);
            
            // Run migration in a transaction
            await this.db.withTransactionAsync(async () => {
              await migration.up(this.db);
              
              // Record migration in schema_info
              await this.db.runAsync(
                'INSERT OR REPLACE INTO schema_info (version, applied_at, app_version) VALUES (?, ?, ?)',
                [migration.version, Math.floor(Date.now() / 1000), '1.0.0']
              );
            });

            const executionTime = Date.now() - startTime;
            results.push({
              version: migration.version,
              success: true,
              executionTime
            });

            console.log(`✓ Migration ${migration.version} completed in ${executionTime}ms`);
          } catch (error) {
            const executionTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            results.push({
              version: migration.version,
              success: false,
              error: errorMessage,
              executionTime
            });

            console.error(`✗ Migration ${migration.version} failed:`, errorMessage);
            throw new Error(`Migration ${migration.version} failed: ${errorMessage}`);
          }
        }
      }

      console.log('All migrations completed successfully');
      return results;
    } catch (error) {
      console.error('Migration process failed:', error);
      throw error;
    }
  }

  async getCurrentVersion(): Promise<number> {
    try {
      const result = await this.db.getFirstAsync<{ version: number }>(
        'SELECT MAX(version) as version FROM schema_info'
      );
      return result?.version || 0;
    } catch (error) {
      console.log('Schema info table does not exist yet, returning version 0');
      return 0;
    }
  }

  getLatestVersion(): number {
    return Math.max(...this.migrations.map(m => m.version));
  }

  async getMigrationHistory(): Promise<any[]> {
    try {
      const results = await this.db.getAllAsync(
        'SELECT * FROM schema_info ORDER BY version ASC'
      );
      return results;
    } catch (error) {
      console.log('Could not retrieve migration history:', error);
      return [];
    }
  }

  async validateSchema(): Promise<ValidationResult> {
    const errors: string[] = [];
    
    try {
      // Check if required tables exist
      const requiredTables = ['recipes', 'recipe_images', 'user_preferences', 'schema_info'];
      
      for (const tableName of requiredTables) {
        const result = await this.db.getFirstAsync<{ count: number }>(
          "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name=?",
          [tableName]
        );
        
        if (!result || result.count === 0) {
          errors.push(`Required table '${tableName}' is missing`);
        }
      }

      // Check if FTS table exists
      const ftsResult = await this.db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='recipes_fts'",
        ['recipes_fts']
      );
      
      if (!ftsResult || ftsResult.count === 0) {
        errors.push("Full-text search table 'recipes_fts' is missing");
      }

      // Validate recipes table structure
      try {
        const columns = await this.db.getAllAsync(
          "PRAGMA table_info(recipes)"
        );
        
        const requiredColumns = [
          'id', 'title', 'description', 'ingredients', 'instructions',
          'created_at', 'modified_at', 'is_favorite'
        ];
        
        const existingColumns = columns.map((col: any) => col.name);
        
        for (const colName of requiredColumns) {
          if (!existingColumns.includes(colName)) {
            errors.push(`Required column '${colName}' is missing from recipes table`);
          }
        }
      } catch (error) {
        errors.push(`Could not validate recipes table structure: ${error}`);
      }

      // Check current version matches latest
      const currentVersion = await this.getCurrentVersion();
      const latestVersion = this.getLatestVersion();
      
      if (currentVersion < latestVersion) {
        errors.push(`Schema version ${currentVersion} is behind latest version ${latestVersion}`);
      }

    } catch (error) {
      errors.push(`Schema validation failed: ${error}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async rollbackToVersion(targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    
    if (targetVersion >= currentVersion) {
      throw new Error(`Cannot rollback to version ${targetVersion} - current version is ${currentVersion}`);
    }

    console.log(`Rolling back from version ${currentVersion} to ${targetVersion}`);

    // Find migrations to rollback (in reverse order)
    const migrationsToRollback = this.migrations
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version);

    for (const migration of migrationsToRollback) {
      if (!migration.down) {
        throw new Error(`Migration ${migration.version} does not support rollback`);
      }

      try {
        console.log(`Rolling back migration ${migration.version}`);
        
        await this.db.withTransactionAsync(async () => {
          await migration.down!(this.db);
          
          // Remove migration record
          await this.db.runAsync(
            'DELETE FROM schema_info WHERE version = ?',
            [migration.version]
          );
        });

        console.log(`✓ Rolled back migration ${migration.version}`);
      } catch (error) {
        console.error(`✗ Failed to rollback migration ${migration.version}:`, error);
        throw error;
      }
    }

    console.log(`Rollback to version ${targetVersion} completed`);
  }

  async repairDatabase(): Promise<void> {
    console.log('Starting database repair...');
    
    try {
      // Run integrity check
      const integrityResult = await this.db.getFirstAsync<{ integrity_check: string }>(
        'PRAGMA integrity_check'
      );
      
      if (integrityResult?.integrity_check !== 'ok') {
        console.warn('Database integrity check failed:', integrityResult?.integrity_check);
      }

      // Rebuild FTS index if it exists
      try {
        await this.db.execAsync("INSERT INTO recipes_fts(recipes_fts) VALUES('rebuild')");
        console.log('FTS index rebuilt successfully');
      } catch (error) {
        console.log('Could not rebuild FTS index (may not exist):', error);
      }

      // Analyze tables for query optimization
      await this.db.execAsync('ANALYZE');
      console.log('Database analysis completed');

      console.log('Database repair completed');
    } catch (error) {
      console.error('Database repair failed:', error);
      throw error;
    }
  }
}
