
export interface Recipe {
  id: string;
  title: string;
  description?: string;
  ingredients?: string;
  instructions?: string;
  source_url?: string;
  servings?: number;
  prep_time?: number;
  cook_time?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  cuisine?: string;
  tags?: string[];
  rating?: number;
  is_favorite: boolean;
  notes?: string;
  created_at: number;
  modified_at: number;
}

export interface RecipeImage {
  id: string;
  recipe_id: string;
  image_path: string;
  thumbnail_path?: string;
  position: number;
}

export interface UserPreference {
  key: string;
  value: string;
}

export interface SchemaInfo {
  version: number;
  applied_at: number;
  app_version?: string;
}

export type RecipeFormData = Omit<Recipe, 'id' | 'created_at' | 'modified_at'>;

export interface SearchFilters {
  cuisine?: string;
  difficulty?: string;
  rating?: number;
  maxPrepTime?: number;
  maxCookTime?: number;
  tags?: string[];
}

export type SortOption = 'date' | 'name' | 'rating' | 'prep_time' | 'cook_time';
export type SortOrder = 'asc' | 'desc';
