
import { Recipe } from '../types/Recipe';
import { ShareableRecipe, DeepLinkData, ImportValidationResult } from '../types/Sharing';
import { getRecipe, getAllRecipes } from './database';
import CryptoJS from 'crypto-js';

const DEEP_LINK_SCHEME = 'myrecipebox';
const MAX_LINK_SIZE = 2048; // 2KB limit
const CURRENT_VERSION = 1;

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

// Generate deep link from recipe
export const generateDeepLink = (recipe: Recipe): string => {
  console.log('Generating deep link for recipe:', recipe.title);
  
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
  
  console.log('Generated deep link, size:', deepLink.length);
  return deepLink;
};

// Parse deep link and validate
export const parseDeepLink = async (deepLink: string): Promise<ImportValidationResult> => {
  console.log('Parsing deep link:', deepLink);
  
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
      jsonString = decodeURIComponent(escape(atob(base64Data)));
    } catch (error) {
      console.error('Failed to decode base64:', error);
      return {
        isValid: false,
        error: 'corrupted',
        errorMessage: 'Link damaged, ask for reshare',
      };
    }

    // Parse JSON
    let deepLinkData: DeepLinkData;
    try {
      deepLinkData = JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return {
        isValid: false,
        error: 'corrupted',
        errorMessage: 'Link damaged, ask for reshare',
      };
    }

    // Validate structure
    if (!deepLinkData.recipe || !deepLinkData.timestamp) {
      return {
        isValid: false,
        error: 'invalid',
        errorMessage: 'Cannot read this recipe',
      };
    }

    const recipe = deepLinkData.recipe;

    // Validate required fields
    if (!recipe.title || !recipe.version || !recipe.checksum) {
      return {
        isValid: false,
        error: 'invalid',
        errorMessage: 'Cannot read this recipe',
      };
    }

    // Validate checksum
    const recipeForChecksum = { ...recipe };
    delete recipeForChecksum.checksum;
    const calculatedChecksum = CryptoJS.MD5(JSON.stringify(recipeForChecksum)).toString();
    
    if (calculatedChecksum !== recipe.checksum) {
      console.error('Checksum mismatch:', calculatedChecksum, 'vs', recipe.checksum);
      return {
        isValid: false,
        error: 'corrupted',
        errorMessage: 'Link damaged, ask for reshare',
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
