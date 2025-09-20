
import { Recipe } from '../types/Recipe';
import { ShareableRecipe, DeepLinkData, ImportValidationResult, ShareData, BackupMetadata } from '../types/Sharing';
import { getRecipe, getAllRecipes, getMigrationInfo } from './database';
import CryptoJS from 'crypto-js';

const DEEP_LINK_SCHEME = 'myrecipebox';
const MAX_LINK_SIZE = 2048; // 2KB limit
const CURRENT_VERSION = 3; // Updated to v3
const APP_VERSION = '1.3.0';

// Version compatibility fields
const FIELDS = {
  1: ['id', 'title', 'ingredients', 'instructions'],
  2: ['id', 'title', 'ingredients', 'instructions', 'cooking_method', 'source_type'],
  3: ['id', 'title', 'ingredients', 'instructions', 'cooking_method', 'source_type', 'nutrition']
};

// Error messages
const MSG = {
  UPDATE_REQUIRED: "Update app to import this recipe",
  PARTIAL: "Some recipe data will be lost",
  CORRUPTED: "Recipe data is corrupted",
  NEWER: "Recipe from newer app version"
};

// Create versioned share data
export const createShareData = (recipe: Recipe): ShareData => {
  const shareData: ShareData = {
    v: CURRENT_VERSION,
    ts: Date.now(),
    app: APP_VERSION,
    recipe: {
      // v1 (required)
      id: recipe.id,
      title: recipe.title,
      ingredients: recipe.ingredients || '',
      instructions: recipe.instructions || '',
      
      // v2+ (optional)
      cooking_method: recipe.difficulty || null, // Map difficulty to cooking_method for now
      source_type: recipe.source_url ? 'url' : 'manual',
      
      // v3+ (optional)
      nutrition: null // Not implemented yet, placeholder
    }
  };

  return shareData;
};

// Convert Recipe to ShareableRecipe (exclude images and personal data)
export const createShareableRecipe = (recipe: Recipe): ShareableRecipe => {
  const shareableData = {
    title: recipe.title,
    description: recipe.description,
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    servings: recipe.servings,
    prep_time: recipe.prep_time,
    cook_time: recipe.cook_time,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine,
    tags: recipe.tags,
    rating: recipe.rating,
    notes: recipe.notes,
    version: CURRENT_VERSION,
    checksum: '', // Will be calculated below
  };

  // Calculate checksum for data integrity
  const dataString = JSON.stringify(shareableData);
  shareableData.checksum = CryptoJS.MD5(dataString).toString();

  return shareableData;
};

// Generate versioned deep link from recipe
export const generateDeepLink = (recipe: Recipe): string => {
  console.log('Generating versioned deep link for recipe:', recipe.title);
  
  const shareData = createShareData(recipe);
  
  // Use proper base64 encoding for cross-platform compatibility
  const jsonString = JSON.stringify(shareData);
  let base64Data: string;
  
  if (typeof btoa !== 'undefined') {
    // Browser environment
    base64Data = btoa(unescape(encodeURIComponent(jsonString)));
  } else {
    // React Native environment
    const { encode } = require('react-native-base64');
    base64Data = encode(jsonString);
  }
  
  const deepLink = `${DEEP_LINK_SCHEME}://import/${base64Data}`;
  
  // Check size limit
  if (deepLink.length > MAX_LINK_SIZE) {
    console.warn('Deep link exceeds size limit:', deepLink.length);
    throw new Error('Recipe data too large for sharing');
  }
  
  console.log('Generated versioned deep link, size:', deepLink.length);
  return deepLink;
};

// Legacy method for backward compatibility
export const generateLegacyDeepLink = (recipe: Recipe): string => {
  console.log('Generating legacy deep link for recipe:', recipe.title);
  
  const shareableRecipe = createShareableRecipe(recipe);
  const deepLinkData: DeepLinkData = {
    recipe: shareableRecipe,
    timestamp: Date.now(),
  };

  // Convert to base64
  const jsonString = JSON.stringify(deepLinkData);
  const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
  
  const deepLink = `${DEEP_LINK_SCHEME}://import/${base64Data}`;
  
  // Check size limit
  if (deepLink.length > MAX_LINK_SIZE) {
    console.warn('Deep link exceeds size limit:', deepLink.length);
    throw new Error('Recipe data too large for sharing');
  }
  
  console.log('Generated legacy deep link, size:', deepLink.length);
  return deepLink;
};

// Transform recipe data between versions
export const transform = (recipe: any, toVersion: number): any => {
  switch (toVersion) {
    case 2:
      return {
        ...recipe,
        cooking_method: recipe.cooking_method || null,
        source_type: recipe.source_type || 'manual'
      };
    case 3:
      return {
        ...recipe,
        nutrition: recipe.nutrition || null
      };
    default:
      return recipe;
  }
};

// Get compatible fields for a version
export const getCompatibleFields = (recipe: any, maxVersion: number): any => {
  const fields = FIELDS[maxVersion] || FIELDS[1];
  return fields.reduce((obj: any, key: string) => {
    if (recipe[key] !== undefined) {
      obj[key] = recipe[key];
    }
    return obj;
  }, {});
};

// Handle import with version compatibility
export const handleImport = async (data: string): Promise<{ ok?: boolean; recipe?: any; error?: string; partial?: boolean }> => {
  try {
    let decodedData: string;
    
    if (typeof atob !== 'undefined') {
      // Browser environment
      decodedData = atob(data);
    } else {
      // React Native environment
      const { decode } = require('react-native-base64');
      decodedData = decode(data);
    }
    
    const shareData = JSON.parse(decodedData);
    const migrationInfo = await getMigrationInfo();
    const currentVersion = migrationInfo.currentVersion;
    const shareVersion = shareData.v || 1;
    
    console.log(`Import: Share v${shareVersion}, Current v${currentVersion}`);
    
    // Check version compatibility
    if (shareVersion > currentVersion) {
      return {
        error: 'UPDATE_REQUIRED',
        partial: true
      };
    }
    
    // Transform recipe data to current version
    let recipe = shareData.recipe;
    for (let v = shareVersion + 1; v <= currentVersion; v++) {
      recipe = transform(recipe, v);
    }
    
    return { ok: true, recipe };
  } catch (error) {
    console.error('Import failed:', error);
    return { error: 'CORRUPTED' };
  }
};

// Parse deep link and validate (updated for version compatibility)
export const parseDeepLink = async (deepLink: string): Promise<ImportValidationResult> => {
  console.log('Parsing versioned deep link:', deepLink);
  
  try {
    // Extract base64 data from deep link
    const linkPrefix = `${DEEP_LINK_SCHEME}://import/`;
    if (!deepLink.startsWith(linkPrefix)) {
      return {
        isValid: false,
        error: 'invalid',
        errorMessage: 'Invalid deep link format',
      };
    }

    const base64Data = deepLink.substring(linkPrefix.length);
    
    // Check size limit
    if (deepLink.length > MAX_LINK_SIZE) {
      return {
        isValid: false,
        error: 'size_limit',
        errorMessage: 'Link data exceeds size limit',
      };
    }

    // Decode base64
    let jsonString: string;
    try {
      if (typeof atob !== 'undefined') {
        // Browser environment
        jsonString = decodeURIComponent(escape(atob(base64Data)));
      } else {
        // React Native environment
        const { decode } = require('react-native-base64');
        jsonString = decode(base64Data);
      }
    } catch (error) {
      console.error('Failed to decode base64:', error);
      return {
        isValid: false,
        error: 'corrupted',
        errorMessage: MSG.CORRUPTED,
      };
    }

    // Parse JSON - try new format first, then legacy
    let shareData: ShareData | null = null;
    let legacyData: DeepLinkData | null = null;
    
    try {
      const parsed = JSON.parse(jsonString);
      
      // Check if it's new versioned format
      if (parsed.v && parsed.recipe) {
        shareData = parsed as ShareData;
      } else if (parsed.recipe && parsed.timestamp) {
        // Legacy format
        legacyData = parsed as DeepLinkData;
      } else {
        throw new Error('Unknown format');
      }
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return {
        isValid: false,
        error: 'corrupted',
        errorMessage: MSG.CORRUPTED,
      };
    }

    let recipe: any;
    let shareVersion: number;

    if (shareData) {
      // New versioned format
      recipe = shareData.recipe;
      shareVersion = shareData.v;
      
      // Validate required fields for versioned format
      if (!recipe.id || !recipe.title) {
        return {
          isValid: false,
          error: 'invalid',
          errorMessage: 'Cannot read this recipe',
        };
      }
    } else if (legacyData) {
      // Legacy format
      recipe = legacyData.recipe;
      shareVersion = recipe.version || 1;
      
      // Validate legacy format
      if (!recipe.title || !recipe.checksum) {
        return {
          isValid: false,
          error: 'invalid',
          errorMessage: 'Cannot read this recipe',
        };
      }

      // Validate checksum for legacy format
      const recipeForChecksum = { ...recipe };
      delete recipeForChecksum.checksum;
      const calculatedChecksum = CryptoJS.MD5(JSON.stringify(recipeForChecksum)).toString();
      
      if (calculatedChecksum !== recipe.checksum) {
        console.error('Checksum mismatch:', calculatedChecksum, 'vs', recipe.checksum);
        return {
          isValid: false,
          error: 'corrupted',
          errorMessage: MSG.CORRUPTED,
        };
      }
    } else {
      return {
        isValid: false,
        error: 'invalid',
        errorMessage: 'Cannot read this recipe',
      };
    }

    // Check version compatibility
    const migrationInfo = await getMigrationInfo();
    const currentVersion = migrationInfo.currentVersion;
    
    if (shareVersion > currentVersion) {
      return {
        isValid: false,
        error: 'version_mismatch',
        errorMessage: MSG.UPDATE_REQUIRED,
      };
    }

    // Check for duplicates
    const existingRecipes = await getAllRecipes();
    const isDuplicate = existingRecipes.some(existing => 
      existing.title === recipe.title &&
      existing.ingredients === recipe.ingredients &&
      existing.instructions === recipe.instructions
    );

    if (isDuplicate) {
      return {
        isValid: false,
        error: 'duplicate',
        errorMessage: 'Already have this recipe',
      };
    }

    console.log('Deep link validation successful');
    return {
      isValid: true,
      recipe,
      shareVersion,
      currentVersion,
    };

  } catch (error) {
    console.error('Unexpected error parsing deep link:', error);
    return {
      isValid: false,
      error: 'invalid',
      errorMessage: 'Cannot read this recipe',
    };
  }
};

// Generate two-link share message
export const generateShareMessage = (recipe: Recipe): string => {
  const deepLink = generateDeepLink(recipe);
  const webLink = `https://myrecipebox.app/view/${recipe.id}`;
  
  return `🍳 ${recipe.title}

No app? View here:
${webLink}

Have app? Import:
${deepLink}`;
};

// Sanitize input for security
export const sanitizeRecipeData = (recipe: ShareableRecipe): ShareableRecipe => {
  const sanitize = (text?: string): string | undefined => {
    if (!text) return text;
    // Remove potentially harmful characters and limit length
    return text
      .replace(/[<>]/g, '') // Remove HTML-like characters
      .substring(0, 5000) // Limit length
      .trim();
  };

  return {
    ...recipe,
    title: sanitize(recipe.title) || 'Untitled Recipe',
    description: sanitize(recipe.description),
    ingredients: sanitize(recipe.ingredients),
    instructions: sanitize(recipe.instructions),
    notes: sanitize(recipe.notes),
    cuisine: sanitize(recipe.cuisine),
    tags: recipe.tags?.map(tag => sanitize(tag)).filter(Boolean) || [],
  };
};

// Convert ShareableRecipe to Recipe for import
export const convertToRecipe = (shareableRecipe: ShareableRecipe): Omit<Recipe, 'id' | 'created_at' | 'modified_at'> => {
  const sanitizedRecipe = sanitizeRecipeData(shareableRecipe);
  
  return {
    title: sanitizedRecipe.title,
    description: sanitizedRecipe.description,
    ingredients: sanitizedRecipe.ingredients,
    instructions: sanitizedRecipe.instructions,
    servings: sanitizedRecipe.servings,
    prep_time: sanitizedRecipe.prep_time,
    cook_time: sanitizedRecipe.cook_time,
    difficulty: sanitizedRecipe.difficulty,
    cuisine: sanitizedRecipe.cuisine,
    tags: sanitizedRecipe.tags,
    rating: sanitizedRecipe.rating,
    notes: sanitizedRecipe.notes,
    is_favorite: false,
    source_url: undefined,
  };
};
