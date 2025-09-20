
import { BackupMetadata } from '../types/Sharing';
import { getMigrationInfo } from './database';

const APP_VERSION = '1.3.0';

// Create backup metadata with version info
export const createBackupMetadata = async (recipeCount: number): Promise<BackupMetadata> => {
  const migrationInfo = await getMigrationInfo();
  
  return {
    created: Date.now(),
    app: APP_VERSION,
    schema: migrationInfo.currentVersion,
    count: recipeCount,
  };
};

// Check backup compatibility
export const checkBackupCompatibility = async (metadata: BackupMetadata): Promise<{
  compatible: boolean;
  requiresUpdate: boolean;
  dataLoss: boolean;
  message: string;
}> => {
  const migrationInfo = await getMigrationInfo();
  const backupVersion = metadata.schema;
  const currentVersion = migrationInfo.currentVersion;
  
  if (backupVersion === currentVersion) {
    return {
      compatible: true,
      requiresUpdate: false,
      dataLoss: false,
      message: 'Backup is fully compatible',
    };
  }
  
  if (backupVersion > currentVersion) {
    return {
      compatible: false,
      requiresUpdate: true,
      dataLoss: true,
      message: 'Backup from newer app version. Update app to restore fully.',
    };
  }
  
  if (backupVersion < currentVersion) {
    return {
      compatible: true,
      requiresUpdate: false,
      dataLoss: false,
      message: 'Backup from older version. Will be migrated during restore.',
    };
  }
  
  return {
    compatible: false,
    requiresUpdate: false,
    dataLoss: true,
    message: 'Unknown backup version',
  };
};

// Migrate backup data to current version
export const migrateBackupData = async (backupData: any, fromVersion: number): Promise<any> => {
  const migrationInfo = await getMigrationInfo();
  const currentVersion = migrationInfo.currentVersion;
  
  console.log(`Migrating backup data from v${fromVersion} to v${currentVersion}`);
  
  let migratedData = { ...backupData };
  
  // Apply migrations step by step
  for (let version = fromVersion + 1; version <= currentVersion; version++) {
    migratedData = applyMigration(migratedData, version);
  }
  
  return migratedData;
};

// Apply specific migration to backup data
const applyMigration = (data: any, toVersion: number): any => {
  console.log(`Applying migration to version ${toVersion}`);
  
  switch (toVersion) {
    case 2:
      // Add cooking_method and source_type fields
      if (data.database && Array.isArray(data.database)) {
        data.database = data.database.map((recipe: any) => ({
          ...recipe,
          cooking_method: recipe.cooking_method || null,
          source_type: recipe.source_type || (recipe.source_url ? 'url' : 'manual'),
        }));
      }
      break;
      
    case 3:
      // Add nutrition field
      if (data.database && Array.isArray(data.database)) {
        data.database = data.database.map((recipe: any) => ({
          ...recipe,
          nutrition: recipe.nutrition || null,
        }));
      }
      break;
      
    default:
      console.log(`No migration defined for version ${toVersion}`);
      break;
  }
  
  return data;
};

// Get version compatibility matrix
export const getVersionMatrix = () => {
  return {
    '1→1': { status: '✅', description: 'Perfect compatibility' },
    '1→2': { status: '✅', description: 'Upgraded with defaults' },
    '1→3': { status: '✅', description: 'Upgraded with defaults' },
    '2→1': { status: '⚠️', description: 'Partial data loss' },
    '2→2': { status: '✅', description: 'Perfect compatibility' },
    '2→3': { status: '✅', description: 'Upgraded with defaults' },
    '3→1': { status: '⚠️', description: 'Significant data loss' },
    '3→2': { status: '⚠️', description: 'Partial data loss' },
    '3→3': { status: '✅', description: 'Perfect compatibility' },
  };
};

// Validate backup integrity
export const validateBackupIntegrity = (backupData: any): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Check required fields
  if (!backupData.metadata) {
    errors.push('Missing backup metadata');
  }
  
  if (!backupData.database || !Array.isArray(backupData.database)) {
    errors.push('Invalid or missing recipe database');
  }
  
  if (!backupData.timestamp || typeof backupData.timestamp !== 'number') {
    errors.push('Invalid or missing timestamp');
  }
  
  // Check metadata structure
  if (backupData.metadata) {
    const { created, app, schema, count } = backupData.metadata;
    
    if (!created || typeof created !== 'number') {
      errors.push('Invalid metadata: missing or invalid created timestamp');
    }
    
    if (!app || typeof app !== 'string') {
      errors.push('Invalid metadata: missing or invalid app version');
    }
    
    if (schema === undefined || typeof schema !== 'number') {
      errors.push('Invalid metadata: missing or invalid schema version');
    }
    
    if (count === undefined || typeof count !== 'number') {
      errors.push('Invalid metadata: missing or invalid recipe count');
    }
    
    // Verify recipe count matches actual data
    if (backupData.database && backupData.database.length !== count) {
      errors.push(`Recipe count mismatch: metadata says ${count}, found ${backupData.database.length}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Create version-aware backup filename
export const createBackupFilename = (metadata: BackupMetadata): string => {
  const date = new Date(metadata.created).toISOString().split('T')[0];
  const timestamp = metadata.created;
  return `backup_v${metadata.schema}_${date}_${timestamp}.json`;
};

// Parse backup filename to extract version info
export const parseBackupFilename = (filename: string): {
  version?: number;
  date?: string;
  timestamp?: number;
} => {
  const match = filename.match(/backup_v(\d+)_(\d{4}-\d{2}-\d{2})_(\d+)\.json/);
  
  if (match) {
    return {
      version: parseInt(match[1]),
      date: match[2],
      timestamp: parseInt(match[3]),
    };
  }
  
  // Fallback for legacy filenames
  const legacyMatch = filename.match(/backup_(\d{4}-\d{2}-\d{2})_(\d+)\.json/);
  if (legacyMatch) {
    return {
      version: 1, // Assume v1 for legacy backups
      date: legacyMatch[1],
      timestamp: parseInt(legacyMatch[2]),
    };
  }
  
  return {};
};
