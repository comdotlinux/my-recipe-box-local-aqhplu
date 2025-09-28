
import { documentDirectory, getInfoAsync, makeDirectoryAsync, copyAsync, deleteAsync, readDirectoryAsync, writeAsStringAsync, readAsStringAsync } from 'expo-file-system';
import { Platform } from 'react-native';

export interface ImageInfo {
  uri: string;
  width: number;
  height: number;
  size: number;
}

export const createImagesDirectory = async (): Promise<string> => {
  if (!documentDirectory) {
    throw new Error('Document directory not available');
  }

  const imagesDir = `${documentDirectory}images/`;
  const dirInfo = await getInfoAsync(imagesDir);
  
  if (!dirInfo.exists) {
    await makeDirectoryAsync(imagesDir, { intermediates: true });
    console.log('Created images directory:', imagesDir);
  }
  
  return imagesDir;
};

export const saveImageToAppDirectory = async (imageUri: string, recipeId?: string): Promise<string | null> => {
  try {
    console.log('Saving image to app directory:', imageUri);
    
    if (!documentDirectory) {
      console.error('Document directory not available');
      return null;
    }
    
    const imagesDir = await createImagesDirectory();
    
    // Generate unique filename
    const timestamp = Date.now();
    const prefix = recipeId ? `recipe_${recipeId}` : 'recipe';
    const filename = `${prefix}_${timestamp}.jpg`;
    const newPath = `${imagesDir}${filename}`;

    // Copy image to app directory
    await copyAsync({
      from: imageUri,
      to: newPath,
    });

    console.log('Image saved to:', newPath);
    return newPath;
  } catch (error) {
    console.error('Failed to save image:', error);
    return null;
  }
};

export const deleteImage = async (imagePath: string): Promise<boolean> => {
  try {
    const fileInfo = await getInfoAsync(imagePath);
    if (fileInfo.exists) {
      await deleteAsync(imagePath);
      console.log('Image deleted:', imagePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to delete image:', error);
    return false;
  }
};

export const getImageInfo = async (imagePath: string): Promise<ImageInfo | null> => {
  try {
    const fileInfo = await getInfoAsync(imagePath);
    if (!fileInfo.exists) {
      return null;
    }

    // For now, return basic info. In a full implementation, you might want to
    // use expo-image-manipulator to get actual dimensions
    return {
      uri: imagePath,
      width: 0, // Would need expo-image-manipulator to get actual dimensions
      height: 0,
      size: fileInfo.size || 0,
    };
  } catch (error) {
    console.error('Failed to get image info:', error);
    return null;
  }
};

export const resizeImage = async (
  imageUri: string, 
  maxWidth: number = 800, 
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<string | null> => {
  try {
    // This would require expo-image-manipulator for actual resizing
    // For now, just return the original URI
    console.log('Image resizing not implemented yet, returning original URI');
    return imageUri;
  } catch (error) {
    console.error('Failed to resize image:', error);
    return null;
  }
};

export const createThumbnail = async (
  imageUri: string,
  size: number = 150
): Promise<string | null> => {
  try {
    // This would require expo-image-manipulator for thumbnail creation
    // For now, just return the original URI
    console.log('Thumbnail creation not implemented yet, returning original URI');
    return imageUri;
  } catch (error) {
    console.error('Failed to create thumbnail:', error);
    return null;
  }
};

export const validateImageFile = (uri: string): boolean => {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const lowerUri = uri.toLowerCase();
  return validExtensions.some(ext => lowerUri.endsWith(ext));
};

export const getImageDisplayUri = (imagePath: string): string => {
  // Handle different URI formats
  if (imagePath.startsWith('file://')) {
    return imagePath;
  }
  
  if (imagePath.startsWith('/')) {
    return Platform.OS === 'android' ? `file://${imagePath}` : imagePath;
  }
  
  return imagePath;
};

export const cleanupOrphanedImages = async (usedImagePaths: string[]): Promise<void> => {
  try {
    const imagesDir = await createImagesDirectory();
    const files = await readDirectoryAsync(imagesDir);
    
    for (const file of files) {
      const fullPath = `${imagesDir}${file}`;
      if (!usedImagePaths.includes(fullPath)) {
        await deleteImage(fullPath);
        console.log('Cleaned up orphaned image:', fullPath);
      }
    }
  } catch (error) {
    console.error('Failed to cleanup orphaned images:', error);
  }
};
