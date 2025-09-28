
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { commonStyles, colors, typography, spacing, borderRadius, buttonStyles } from '../../styles/commonStyles';
import { AppDispatch } from '../../store';
import { createRecipe } from '../../store/slices/recipesSlice';
import { Recipe } from '../../types/Recipe';
import Icon from '../../components/Icon';
import { saveImageToAppDirectory, getImageDisplayUri } from '../../utils/imageUtils';

export default function AddRecipeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    source_url: '',
    servings: '',
    prep_time: '',
    cook_time: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    cuisine: '',
    tags: '',
    notes: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTakePhoto = async () => {
    console.log('Taking photo...');
    
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission Needed',
        text2: 'Camera permission is required to take photos.',
        position: 'bottom',
        bottomOffset: 100,
      });
      return;
    }

    setIsProcessingImage(true);
    
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Photo taken:', result.assets[0].uri);
        const savedPath = await saveImageToAppDirectory(result.assets[0].uri);
        
        if (savedPath) {
          setSelectedImage(savedPath);
          // Auto-fill title if empty and we have an image
          if (!formData.title.trim()) {
            handleInputChange('title', 'New Recipe');
          }
          console.log('Photo processed and saved successfully');
          Toast.show({
            type: 'success',
            text1: 'Photo Added',
            text2: 'Your photo has been added to the recipe.',
            position: 'bottom',
            bottomOffset: 100,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Failed to Save Photo',
            text2: 'Please try again.',
            position: 'bottom',
            bottomOffset: 100,
          });
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Take Photo',
        text2: 'Please try again.',
        position: 'bottom',
        bottomOffset: 100,
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handlePickImage = async () => {
    console.log('Picking image from gallery...');
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Permission Needed',
        text2: 'Gallery permission is required to select photos.',
        position: 'bottom',
        bottomOffset: 100,
      });
      return;
    }

    setIsProcessingImage(true);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        console.log('Image selected:', result.assets[0].uri);
        const savedPath = await saveImageToAppDirectory(result.assets[0].uri);
        
        if (savedPath) {
          setSelectedImage(savedPath);
          // Auto-fill title if empty and we have an image
          if (!formData.title.trim()) {
            handleInputChange('title', 'New Recipe');
          }
          console.log('Image processed and saved successfully');
          Toast.show({
            type: 'success',
            text1: 'Image Added',
            text2: 'Your image has been added to the recipe.',
            position: 'bottom',
            bottomOffset: 100,
          });
        } else {
          Toast.show({
            type: 'error',
            text1: 'Failed to Save Image',
            text2: 'Please try again.',
            position: 'bottom',
            bottomOffset: 100,
          });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to Select Image',
        text2: 'Please try again.',
        position: 'bottom',
        bottomOffset: 100,
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = () => {
    console.log('Removing selected image');
    setSelectedImage(null);
    Toast.show({
      type: 'success',
      text1: 'Image Removed',
      text2: 'The image has been removed from the recipe.',
      position: 'bottom',
      bottomOffset: 100,
    });
  };

  const handleSaveRecipe = async () => {
    if (isSaving) return;
    
    console.log('Saving recipe with data:', { 
      title: formData.title, 
      source_url: formData.source_url,
      hasImage: !!selectedImage 
    });
    
    // Validate required fields - only title is mandatory
    if (!formData.title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Missing Title',
        text2: 'Please enter a recipe title to save your recipe.',
        position: 'bottom',
        bottomOffset: 100,
      });
      return;
    }

    setIsSaving(true);

    try {
      const recipeData: Omit<Recipe, 'id' | 'created_at' | 'modified_at'> = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        ingredients: formData.ingredients.trim() || undefined,
        instructions: formData.instructions.trim() || undefined,
        source_url: formData.source_url.trim() || undefined,
        servings: formData.servings ? parseInt(formData.servings) : undefined,
        prep_time: formData.prep_time ? parseInt(formData.prep_time) : undefined,
        cook_time: formData.cook_time ? parseInt(formData.cook_time) : undefined,
        difficulty: formData.difficulty,
        cuisine: formData.cuisine.trim() || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        rating: undefined,
        is_favorite: false,
        notes: formData.notes.trim() || undefined,
      };

      // Add image path to notes for now (until we implement proper image storage in database)
      if (selectedImage) {
        const imageNote = `[IMAGE:${selectedImage}]`;
        recipeData.notes = recipeData.notes ? `${recipeData.notes}\n\n${imageNote}` : imageNote;
        console.log('Added image reference to recipe notes');
      }

      console.log('Dispatching createRecipe with data:', recipeData);
      const result = await dispatch(createRecipe(recipeData)).unwrap();
      console.log('Recipe saved successfully with result:', result);
      
      // Show success toast
      Toast.show({
        type: 'success',
        text1: 'Recipe Saved!',
        text2: `"${recipeData.title}" has been added to your collection.`,
        position: 'bottom',
        bottomOffset: 100,
      });
      
      // Navigate back immediately after successful save
      router.back();
      
    } catch (error) {
      console.error('Failed to save recipe:', error);
      setIsSaving(false);
      Toast.show({
        type: 'error',
        text1: 'Failed to Save Recipe',
        text2: error instanceof Error ? error.message : 'Unknown error. Please try again.',
        position: 'bottom',
        bottomOffset: 100,
      });
    }
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={commonStyles.container}>
          {/* Header */}
          <View style={{ padding: spacing.md, paddingBottom: spacing.sm }}>
            <View style={[commonStyles.spaceBetween, { marginBottom: spacing.lg }]}>
              <Text style={typography.headlineMedium}>Add Recipe</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingHorizontal: spacing.md, 
              paddingBottom: spacing.xl + 100 // Extra padding for bottom bar and save button
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Photo Section */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
                Recipe Photo (Optional)
              </Text>
              
              {selectedImage ? (
                <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
                  <Image
                    source={{ uri: getImageDisplayUri(selectedImage) }}
                    style={{
                      width: 200,
                      height: 150,
                      borderRadius: borderRadius.md,
                      marginBottom: spacing.md,
                    }}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    style={[buttonStyles.secondary, { paddingHorizontal: spacing.lg }]}
                    onPress={handleRemoveImage}
                  >
                    <Text style={[commonStyles.buttonText, { color: colors.text }]}>
                      Remove Image
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
                  <View style={{
                    width: 200,
                    height: 150,
                    backgroundColor: colors.surfaceVariant,
                    borderRadius: borderRadius.md,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: spacing.md,
                  }}>
                    <Icon name="camera" size={48} color={colors.textSecondary} />
                    <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm }]}>
                      Add a photo
                    </Text>
                  </View>
                </View>
              )}
              
              <View style={{ flexDirection: 'row', gap: spacing.md }}>
                <TouchableOpacity
                  style={[commonStyles.button, { flex: 1, opacity: isProcessingImage ? 0.6 : 1 }]}
                  onPress={handleTakePhoto}
                  disabled={isProcessingImage}
                >
                  <Text style={commonStyles.buttonText}>
                    {isProcessingImage ? 'Processing...' : 'Take Photo'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[buttonStyles.secondary, { flex: 1, opacity: isProcessingImage ? 0.6 : 1 }]}
                  onPress={handlePickImage}
                  disabled={isProcessingImage}
                >
                  <Text style={[commonStyles.buttonText, { color: colors.text }]}>
                    {isProcessingImage ? 'Processing...' : 'Choose Photo'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Recipe Details */}
            <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
              Recipe Details
            </Text>
            
            {/* Title - Required */}
            <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
              Title *
            </Text>
            <TextInput
              style={[commonStyles.input, { marginBottom: spacing.md }]}
              placeholder="Recipe name"
              placeholderTextColor={colors.textSecondary}
              value={formData.title}
              onChangeText={(value) => handleInputChange('title', value)}
            />

            {/* Description */}
            <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
              Description (Optional)
            </Text>
            <TextInput
              style={[commonStyles.input, { marginBottom: spacing.md, minHeight: 80 }]}
              placeholder="Brief description of the recipe"
              placeholderTextColor={colors.textSecondary}
              value={formData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              multiline
              textAlignVertical="top"
            />

            {/* Source URL */}
            <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
              Source URL (Optional)
            </Text>
            <TextInput
              style={[commonStyles.input, { marginBottom: spacing.md }]}
              placeholder="https://example.com/recipe"
              placeholderTextColor={colors.textSecondary}
              value={formData.source_url}
              onChangeText={(value) => handleInputChange('source_url', value)}
              keyboardType="url"
              autoCapitalize="none"
            />

            {/* Time and Servings Row */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
                  Prep Time (min)
                </Text>
                <TextInput
                  style={commonStyles.input}
                  placeholder="30"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.prep_time}
                  onChangeText={(value) => handleInputChange('prep_time', value)}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
                  Cook Time (min)
                </Text>
                <TextInput
                  style={commonStyles.input}
                  placeholder="45"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.cook_time}
                  onChangeText={(value) => handleInputChange('cook_time', value)}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
                  Servings
                </Text>
                <TextInput
                  style={commonStyles.input}
                  placeholder="4"
                  placeholderTextColor={colors.textSecondary}
                  value={formData.servings}
                  onChangeText={(value) => handleInputChange('servings', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Difficulty and Cuisine Row */}
            <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
                  Difficulty (Optional)
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.xs }}>
                  {(['Easy', 'Medium', 'Hard'] as const).map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={{
                        flex: 1,
                        paddingVertical: spacing.sm,
                        alignItems: 'center',
                        backgroundColor: formData.difficulty === level ? colors.primary : colors.surface,
                        borderRadius: borderRadius.sm,
                      }}
                      onPress={() => handleInputChange('difficulty', level)}
                    >
                      <Text style={{
                        ...typography.labelMedium,
                        color: formData.difficulty === level ? colors.background : colors.text,
                      }}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
                  Cuisine (Optional)
                </Text>
                <TextInput
                  style={commonStyles.input}
                  placeholder="Italian, Mexican, etc."
                  placeholderTextColor={colors.textSecondary}
                  value={formData.cuisine}
                  onChangeText={(value) => handleInputChange('cuisine', value)}
                />
              </View>
            </View>

            {/* Ingredients */}
            <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
              Ingredients (Optional)
            </Text>
            <TextInput
              style={[commonStyles.input, { marginBottom: spacing.md, minHeight: 120 }]}
              placeholder="List ingredients, one per line"
              placeholderTextColor={colors.textSecondary}
              value={formData.ingredients}
              onChangeText={(value) => handleInputChange('ingredients', value)}
              multiline
              textAlignVertical="top"
            />

            {/* Instructions */}
            <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
              Instructions (Optional)
            </Text>
            <TextInput
              style={[commonStyles.input, { marginBottom: spacing.md, minHeight: 120 }]}
              placeholder="Step-by-step cooking instructions"
              placeholderTextColor={colors.textSecondary}
              value={formData.instructions}
              onChangeText={(value) => handleInputChange('instructions', value)}
              multiline
              textAlignVertical="top"
            />

            {/* Tags */}
            <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
              Tags (Optional)
            </Text>
            <TextInput
              style={[commonStyles.input, { marginBottom: spacing.md }]}
              placeholder="vegetarian, quick, healthy (comma separated)"
              placeholderTextColor={colors.textSecondary}
              value={formData.tags}
              onChangeText={(value) => handleInputChange('tags', value)}
            />

            {/* Notes */}
            <Text style={[typography.labelLarge, { marginBottom: spacing.xs }]}>
              Notes (Optional)
            </Text>
            <TextInput
              style={[commonStyles.input, { marginBottom: spacing.xl, minHeight: 80 }]}
              placeholder="Additional notes or tips"
              placeholderTextColor={colors.textSecondary}
              value={formData.notes}
              onChangeText={(value) => handleInputChange('notes', value)}
              multiline
              textAlignVertical="top"
            />

            {/* Info Box */}
            <View style={{
              backgroundColor: colors.surface,
              padding: spacing.md,
              borderRadius: borderRadius.md,
              marginBottom: spacing.lg,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                <Icon name="information-circle" size={20} color={colors.primary} />
                <Text style={[typography.labelMedium, { marginLeft: spacing.sm, color: colors.primary }]}>
                  Recipe Information
                </Text>
              </View>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                Only the recipe title is required. All other fields are optional and can be added later by editing the recipe.
              </Text>
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={{ 
            padding: spacing.md,
            paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
            backgroundColor: colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.outline,
          }}>
            <TouchableOpacity
              style={[commonStyles.button, { 
                width: '100%',
                opacity: isSaving ? 0.6 : 1,
              }]}
              onPress={handleSaveRecipe}
              disabled={isSaving}
            >
              <Text style={commonStyles.buttonText}>
                {isSaving ? 'Saving Recipe...' : 'Save Recipe'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
