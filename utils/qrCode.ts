
import { Recipe } from '../types/Recipe';
import { generateDeepLink } from './sharing';

export interface QRCodeData {
  deepLink: string;
  recipe: Recipe;
}

// Generate QR code data from recipe
export const generateQRCodeData = (recipe: Recipe): QRCodeData => {
  console.log('Generating QR code data for recipe:', recipe.title);
  
  const deepLink = generateDeepLink(recipe);
  
  return {
    deepLink,
    recipe,
  };
};

// Validate QR code size (QR codes have limits)
export const validateQRCodeSize = (data: string): boolean => {
  // QR codes can typically handle up to ~2953 characters in alphanumeric mode
  const maxSize = 2900; // Leave some buffer
  return data.length <= maxSize;
};

// Get QR code error correction level based on data size
export const getQRErrorCorrectionLevel = (dataSize: number): 'L' | 'M' | 'Q' | 'H' => {
  // Use higher error correction for smaller data
  if (dataSize < 500) return 'H'; // High (30%)
  if (dataSize < 1000) return 'Q'; // Quartile (25%)
  if (dataSize < 1500) return 'M'; // Medium (15%)
  return 'L'; // Low (7%)
};
