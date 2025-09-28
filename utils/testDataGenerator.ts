
import { createRecipe } from './database';
import { saveImageToAppDirectory } from './imageUtils';

interface TestRecipeTemplate {
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  cuisine: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prep_time: number;
  cook_time: number;
  servings: number;
  tags: string[];
}

const testRecipeTemplates: TestRecipeTemplate[] = [
  {
    title: 'Classic Spaghetti Carbonara',
    description: 'A traditional Italian pasta dish with eggs, cheese, and pancetta',
    ingredients: '400g spaghetti\n200g pancetta or guanciale\n4 large eggs\n100g Pecorino Romano cheese\nBlack pepper\nSalt',
    instructions: '1. Cook spaghetti in salted boiling water\n2. Fry pancetta until crispy\n3. Whisk eggs with cheese\n4. Combine hot pasta with pancetta\n5. Add egg mixture off heat\n6. Toss quickly and serve',
    cuisine: 'Italian',
    difficulty: 'medium',
    prep_time: 15,
    cook_time: 20,
    servings: 4,
    tags: ['pasta', 'italian', 'quick', 'dinner']
  },
  {
    title: 'Chocolate Chip Cookies',
    description: 'Soft and chewy homemade chocolate chip cookies',
    ingredients: '2¼ cups flour\n1 tsp baking soda\n1 tsp salt\n1 cup butter\n¾ cup brown sugar\n¾ cup white sugar\n2 eggs\n2 tsp vanilla\n2 cups chocolate chips',
    instructions: '1. Preheat oven to 375°F\n2. Mix dry ingredients\n3. Cream butter and sugars\n4. Add eggs and vanilla\n5. Combine wet and dry ingredients\n6. Fold in chocolate chips\n7. Bake 9-11 minutes',
    cuisine: 'American',
    difficulty: 'easy',
    prep_time: 20,
    cook_time: 11,
    servings: 24,
    tags: ['dessert', 'cookies', 'baking', 'sweet']
  },
  {
    title: 'Thai Green Curry',
    description: 'Aromatic and spicy Thai curry with coconut milk',
    ingredients: '2 tbsp green curry paste\n400ml coconut milk\n500g chicken thigh\n1 eggplant\n100g green beans\nThai basil\nFish sauce\nPalm sugar\nLime leaves',
    instructions: '1. Heat curry paste in pan\n2. Add thick coconut milk\n3. Add chicken and cook\n4. Add vegetables\n5. Add remaining coconut milk\n6. Season with fish sauce and sugar\n7. Garnish with basil',
    cuisine: 'Thai',
    difficulty: 'medium',
    prep_time: 25,
    cook_time: 30,
    servings: 4,
    tags: ['curry', 'thai', 'spicy', 'coconut', 'dinner']
  },
  {
    title: 'French Onion Soup',
    description: 'Classic French soup with caramelized onions and cheese',
    ingredients: '6 large onions\n4 cups beef broth\n½ cup dry white wine\n2 tbsp butter\n1 tsp thyme\nSalt and pepper\nGruyere cheese\nBaguette slices',
    instructions: '1. Slice onions thinly\n2. Caramelize onions slowly (45 min)\n3. Add wine and reduce\n4. Add broth and simmer\n5. Season with thyme\n6. Top with bread and cheese\n7. Broil until golden',
    cuisine: 'French',
    difficulty: 'medium',
    prep_time: 20,
    cook_time: 75,
    servings: 4,
    tags: ['soup', 'french', 'comfort', 'cheese']
  },
  {
    title: 'Avocado Toast',
    description: 'Simple and healthy breakfast with ripe avocado',
    ingredients: '2 slices whole grain bread\n1 ripe avocado\nLemon juice\nSalt and pepper\nRed pepper flakes\nOptional: egg, tomato, feta',
    instructions: '1. Toast bread until golden\n2. Mash avocado with lemon\n3. Season with salt and pepper\n4. Spread on toast\n5. Sprinkle with red pepper flakes\n6. Add toppings if desired',
    cuisine: 'Modern',
    difficulty: 'easy',
    prep_time: 10,
    cook_time: 3,
    servings: 2,
    tags: ['breakfast', 'healthy', 'quick', 'vegetarian']
  }
];

const cuisineTypes = ['Italian', 'Thai', 'French', 'Mexican', 'Indian', 'Chinese', 'Japanese', 'American', 'Mediterranean', 'Korean'];
const difficultyLevels: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];
const commonTags = ['quick', 'healthy', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'spicy', 'sweet', 'comfort', 'dinner', 'lunch', 'breakfast', 'dessert', 'appetizer'];

export const generateTestRecipe = (index: number): TestRecipeTemplate => {
  const baseTemplate = testRecipeTemplates[index % testRecipeTemplates.length];
  
  // Add variation to make each recipe unique
  const variation = Math.floor(index / testRecipeTemplates.length) + 1;
  
  return {
    ...baseTemplate,
    title: `${baseTemplate.title} ${variation > 1 ? `(Variation ${variation})` : ''}`,
    description: `${baseTemplate.description} - Test recipe #${index + 1}`,
    cuisine: cuisineTypes[index % cuisineTypes.length],
    difficulty: difficultyLevels[index % difficultyLevels.length],
    prep_time: baseTemplate.prep_time + (index % 10),
    cook_time: baseTemplate.cook_time + (index % 15),
    servings: Math.max(1, baseTemplate.servings + (index % 6) - 3),
    tags: [
      ...baseTemplate.tags.slice(0, 2),
      ...commonTags.slice(index % 5, (index % 5) + 2)
    ]
  };
};

export const createTestRecipes = async (count: number, onProgress?: (current: number, total: number) => void): Promise<string[]> => {
  console.log(`Creating ${count} test recipes...`);
  const recipeIds: string[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const template = generateTestRecipe(i);
      
      const recipeData = {
        title: template.title,
        description: template.description,
        ingredients: template.ingredients,
        instructions: template.instructions,
        cuisine: template.cuisine,
        difficulty: template.difficulty,
        prep_time: template.prep_time,
        cook_time: template.cook_time,
        servings: template.servings,
        tags: template.tags,
        is_favorite: Math.random() < 0.2, // 20% chance of being favorite
        rating: Math.random() < 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined, // 70% chance of having rating
        notes: Math.random() < 0.3 ? `Test notes for recipe ${i + 1}` : undefined, // 30% chance of having notes
      };
      
      const recipeId = await createRecipe(recipeData);
      recipeIds.push(recipeId);
      
      onProgress?.(i + 1, count);
      
      // Add small delay to prevent overwhelming the database
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.error(`Failed to create test recipe ${i + 1}:`, error);
    }
  }
  
  console.log(`Created ${recipeIds.length} test recipes`);
  return recipeIds;
};

export const createPerformanceTestData = async (): Promise<{
  photoOnly: string;
  fullManual: string;
  urlWithNotes: string;
  mixed: string;
  bulkRecipes: string[];
}> => {
  console.log('Creating performance test data...');
  
  // 1. Photo only (minimal)
  const photoOnlyId = await createRecipe({
    title: 'Photo Only Recipe',
    description: undefined,
    ingredients: undefined,
    instructions: undefined,
    tags: [],
    is_favorite: false,
  });
  
  // 2. Full manual (all fields)
  const fullManualId = await createRecipe({
    title: 'Complete Recipe with All Fields',
    description: 'This is a comprehensive recipe with all possible fields filled out for testing purposes.',
    ingredients: 'Ingredient 1\nIngredient 2\nIngredient 3\nIngredient 4\nIngredient 5',
    instructions: 'Step 1: Do this\nStep 2: Do that\nStep 3: Continue\nStep 4: Almost done\nStep 5: Finish',
    source_url: 'https://example.com/recipe',
    servings: 6,
    prep_time: 30,
    cook_time: 45,
    difficulty: 'medium',
    cuisine: 'International',
    tags: ['test', 'complete', 'all-fields', 'comprehensive'],
    rating: 5,
    is_favorite: true,
    notes: 'These are detailed notes about the recipe, including tips, variations, and personal observations.',
  });
  
  // 3. URL + notes
  const urlWithNotesId = await createRecipe({
    title: 'Recipe from URL with Notes',
    description: 'Recipe saved from a website with additional notes',
    source_url: 'https://example.com/another-recipe',
    notes: 'Found this recipe online. Made some modifications: used less salt, added extra herbs.',
    tags: ['url', 'modified', 'online'],
    is_favorite: false,
  });
  
  // 4. Mixed (photo + text + URL)
  const mixedId = await createRecipe({
    title: 'Mixed Method Recipe',
    description: 'Recipe created using multiple input methods',
    ingredients: 'Mixed ingredients from various sources',
    instructions: 'Combined instructions from photo and manual entry',
    source_url: 'https://example.com/mixed-recipe',
    servings: 4,
    prep_time: 20,
    cook_time: 25,
    difficulty: 'easy',
    cuisine: 'Fusion',
    tags: ['mixed', 'photo', 'manual', 'url'],
    rating: 4,
    is_favorite: false,
    notes: 'This recipe combines elements from a photo, manual entry, and a URL source.',
  });
  
  // 5. 100+ recipes for performance testing
  const bulkRecipes = await createTestRecipes(100, (current, total) => {
    if (current % 20 === 0) {
      console.log(`Created ${current}/${total} bulk test recipes`);
    }
  });
  
  console.log('Performance test data creation completed');
  
  return {
    photoOnly: photoOnlyId,
    fullManual: fullManualId,
    urlWithNotes: urlWithNotesId,
    mixed: mixedId,
    bulkRecipes,
  };
};

export const measureSearchPerformance = async (query: string, iterations: number = 10): Promise<{
  averageTime: number;
  minTime: number;
  maxTime: number;
  results: number;
}> => {
  const { searchRecipes } = await import('./database');
  const times: number[] = [];
  let resultCount = 0;
  
  for (let i = 0; i < iterations; i++) {
    const startTime = performance.now();
    const results = await searchRecipes(query);
    const endTime = performance.now();
    
    times.push(endTime - startTime);
    resultCount = results.length;
    
    // Small delay between searches
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  return {
    averageTime: times.reduce((a, b) => a + b, 0) / times.length,
    minTime: Math.min(...times),
    maxTime: Math.max(...times),
    results: resultCount,
  };
};

export const measureDatabasePerformance = async (): Promise<{
  createTime: number;
  readTime: number;
  updateTime: number;
  searchTime: number;
  bulkReadTime: number;
}> => {
  const { createRecipe, getRecipe, updateRecipe, searchRecipes, getAllRecipes } = await import('./database');
  
  // Measure create performance
  const createStart = performance.now();
  const testId = await createRecipe({
    title: 'Performance Test Recipe',
    description: 'Recipe for performance testing',
    ingredients: 'Test ingredients',
    instructions: 'Test instructions',
    tags: ['performance', 'test'],
    is_favorite: false,
  });
  const createTime = performance.now() - createStart;
  
  // Measure read performance
  const readStart = performance.now();
  await getRecipe(testId);
  const readTime = performance.now() - readStart;
  
  // Measure update performance
  const updateStart = performance.now();
  await updateRecipe(testId, { title: 'Updated Performance Test Recipe' });
  const updateTime = performance.now() - updateStart;
  
  // Measure search performance
  const searchStart = performance.now();
  await searchRecipes('performance');
  const searchTime = performance.now() - searchStart;
  
  // Measure bulk read performance
  const bulkReadStart = performance.now();
  await getAllRecipes();
  const bulkReadTime = performance.now() - bulkReadStart;
  
  return {
    createTime,
    readTime,
    updateTime,
    searchTime,
    bulkReadTime,
  };
};

export const cleanupTestData = async (recipeIds: string[]): Promise<void> => {
  const { deleteRecipe } = await import('./database');
  
  console.log(`Cleaning up ${recipeIds.length} test recipes...`);
  
  for (const id of recipeIds) {
    try {
      await deleteRecipe(id);
    } catch (error) {
      console.error(`Failed to delete test recipe ${id}:`, error);
    }
  }
  
  console.log('Test data cleanup completed');
};
