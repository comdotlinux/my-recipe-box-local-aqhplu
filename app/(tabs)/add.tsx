
import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { commonStyles, colors, typography, spacing, borderRadius, buttonStyles } from '../../styles/commonStyles';
import { AppDispatch } from '../../store';
import { createRecipe } from '../../store/slices/recipesSlice';
import { Recipe } from '../../types/Recipe';
import Icon from '../../components/Icon';
import { saveImageToAppDirectory, getImageDisplayUri } from '../../utils/imageUtils';

export default function AddRecipeScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'photo' | 'url' | 'manual'>('manual');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
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
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
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
        } else {
          Alert.alert('Error', 'Failed to save photo. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handlePickImage = async () => {
    console.log('Picking image from gallery...');
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required to select photos.');
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
        } else {
          Alert.alert('Error', 'Failed to save image. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = () => {
    console.log('Removing selected image');
    setSelectedImage(null);
  };

  const handleSaveRecipe = async () => {
    console.log('Saving recipe with data:', { 
      title: formData.title, 
      hasImage: !!selectedImage 
    });
    
    if (!formData.title.trim()) {
      Alert.alert('Missing title', 'Please enter a recipe title.');
      return;
    }

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

      await dispatch(createRecipe(recipeData)).unwrap();
      console.log('Recipe saved successfully');
      
      Alert.alert(
        'Recipe saved!',
        'Your recipe has been added to your collection.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Failed to save recipe:', error);
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    }
  };

  const renderTabButton = (tab: 'photo' | 'url' | 'manual', label: string, icon: string) => (
    <TouchableOpacity
      style={{
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        backgroundColor: activeTab === tab ? colors.primary : colors.surface,
        borderRadius: borderRadius.md,
        marginHorizontal: spacing.xs,
      }}
      onPress={() => setActiveTab(tab)}
    >
      <Icon 
        name={icon as any} 
        size={20} 
        color={activeTab === tab ? colors.background : colors.text} 
      />
      <Text style={{
        ...typography.labelMedium,
        color: activeTab === tab ? colors.background : colors.text,
        marginTop: spacing.xs,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPhotoTab = () => (
    <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
      {selectedImage ? (
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
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
        <>
          <Icon name="camera" size={64} color={colors.textSecondary} />
          <Text style={[typography.titleMedium, { marginTop: spacing.md, marginBottom: spacing.sm }]}>
            Add Recipe Photo
          </Text>
          <Text style={[typography.bodyMedium, { 
            color: colors.textSecondary, 
            textAlign: 'center',
            marginBottom: spacing.lg 
          }]}>
            Take a photo or select from your gallery
          </Text>
        </>
      )}
      
      <View style={{ flexDirection: 'row', gap: spacing.md, width: '100%' }}>
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
  );

  const renderUrlTab = () => (
    <View>
      <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
        Import from URL
      </Text>
      <TextInput
        style={[commonStyles.input, { marginBottom: spacing.md }]}
        placeholder="Paste recipe URL here..."
        placeholderTextColor={colors.textSecondary}
        value={formData.source_url}
        onChangeText={(value) => handleInputChange('source_url', value)}
        keyboardType="url"
        autoCapitalize="none"
      />
      <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
        We'll try to extract recipe information from the URL automatically.
      </Text>
    </View>
  );

  const renderManualTab = () => (
    <View>
      <Text style={[typography.titleMedium, { marginBottom: spacing.md }]}>
        Recipe Details
      </Text>
      
      {/* Show selected image preview in manual tab too */}
      {selectedImage && (
        <View style={{ alignItems: 'center', marginBottom: spacing.md }}>
          <Image
            source={{ uri: getImageDisplayUri(selectedImage) }}
            style={{
              width: 120,
              height: 90,
              borderRadius: borderRadius.md,
              marginBottom: spacing.sm,
            }}
            resizeMode="cover"
          />
          <TouchableOpacity onPress={handleRemoveImage}>
            <Text style={[typography.labelMedium, { color: colors.primary }]}>
              Remove Image
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Title */}
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
        Description
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
            Difficulty
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
            Cuisine
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
        Ingredients
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
        Instructions
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
        Tags
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
        Notes
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
    </View>
  );

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
            <View style={[commonStyles.spaceBetween, { marginBottom: spacing.md }]}>
              <Text style={typography.headlineMedium}>Add Recipe</Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Icon name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Tab Buttons */}
            <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
              {renderTabButton('photo', 'Photo', 'camera')}
              {renderTabButton('url', 'URL', 'link')}
              {renderTabButton('manual', 'Manual', 'create')}
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
            {activeTab === 'photo' && renderPhotoTab()}
            {activeTab === 'url' && renderUrlTab()}
            {activeTab === 'manual' && renderManualTab()}
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
              style={[commonStyles.button, { width: '100%' }]}
              onPress={handleSaveRecipe}
            >
              <Text style={commonStyles.buttonText}>Save Recipe</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
