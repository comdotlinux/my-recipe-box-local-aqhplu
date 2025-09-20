
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

export interface ImportValidationResult {
  isValid: boolean;
  error?: 'corrupted' | 'duplicate' | 'invalid' | 'size_limit';
  errorMessage?: string;
  recipe?: ShareableRecipe;
}

export interface ShareOptions {
  includeAppLink: boolean;
  includeQRCode: boolean;
  includeImage: boolean;
  includePDF: boolean;
}
