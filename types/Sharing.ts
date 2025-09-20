
export interface ShareableRecipe {
  title: string;
  description?: string;
  ingredients?: string;
  instructions?: string;
  servings?: number;
  prep_time?: number;
  cook_time?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  cuisine?: string;
  tags?: string[];
  rating?: number;
  notes?: string;
  version: number;
  checksum: string;
}

export interface DeepLinkData {
  recipe: ShareableRecipe;
  timestamp: number;
}

// New versioned share format
export interface ShareData {
  v: number; // Schema version
  ts: number; // UTC epoch timestamp
  app: string; // App version
  recipe: {
    // v1 (required)
    id: string;
    title: string;
    ingredients: string;
    instructions: string;
    
    // v2+ (optional)
    cooking_method?: string | null;
    source_type?: string;
    
    // v3+ (optional)
    nutrition?: { calories?: number } | null;
  };
}

// Backup metadata for versioning
export interface BackupMetadata {
  created: number; // UTC epoch
  app: string; // App version
  schema: number; // Schema version
  count: number; // Recipe count
}

export interface ImportValidationResult {
  isValid: boolean;
  error?: 'corrupted' | 'duplicate' | 'invalid' | 'size_limit' | 'version_mismatch';
  errorMessage?: string;
  recipe?: ShareableRecipe | any;
  shareVersion?: number;
  currentVersion?: number;
}

export interface ShareOptions {
  includeAppLink: boolean;
  includeQRCode: boolean;
  includeImage: boolean;
  includePDF: boolean;
}

// Version compatibility matrix
export interface VersionCompatibility {
  canImport: boolean;
  requiresUpdate: boolean;
  dataLoss: boolean;
  message: string;
}
