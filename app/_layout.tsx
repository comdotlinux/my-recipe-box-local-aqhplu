
import React, { useEffect, useState } from 'react';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { store, persistor } from '../store';
import { initDatabase } from '../utils/database';
import { parseDeepLink } from '../utils/sharing';
import { setupErrorLogging } from '../utils/errorLogger';
import { colors, typography } from '../styles/commonStyles';

function LoadingScreen() {
  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: colors.background 
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[typography.bodyLarge, { 
        marginTop: 16, 
        color: colors.textSecondary 
      }]}>
        Loading...
      </Text>
    </View>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        
        // Setup error logging
        setupErrorLogging();
        
        // Initialize database
        await initDatabase();
        
        // Handle initial deep link (if app was opened via deep link)
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          console.log('App opened with deep link:', initialUrl);
          handleDeepLink(initialUrl);
        }
        
        // Listen for deep links while app is running
        const subscription = Linking.addEventListener('url', ({ url }) => {
          console.log('Deep link received:', url);
          handleDeepLink(url);
        });
        
        setIsReady(true);
        
        return () => {
          subscription?.remove();
        };
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsReady(true); // Still allow app to start
      }
    };

    initializeApp();
  }, []);

  const handleDeepLink = async (url: string) => {
    console.log('Processing deep link:', url);
    
    try {
      // Check if it's a recipe import link
      if (url.startsWith('myrecipebox://import/')) {
        const validationResult = await parseDeepLink(url);
        
        if (validationResult.isValid && validationResult.recipe) {
          // Navigate to import preview
          router.push({
            pathname: '/import/preview',
            params: {
              recipeData: encodeURIComponent(JSON.stringify(validationResult.recipe)),
            },
          });
        } else {
          // Show error based on validation result
          console.error('Deep link validation failed:', validationResult.errorMessage);
          // The error will be handled in the import preview screen
        }
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
    }
  };

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="recipe/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="scanner" options={{ headerShown: false }} />
              <Stack.Screen name="import/preview" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
