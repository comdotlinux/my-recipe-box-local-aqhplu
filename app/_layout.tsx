
import { setupErrorLogging } from '../utils/errorLogger';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { initDatabase } from '../utils/database';
import { StatusBar } from 'expo-status-bar';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { Platform, View, Text, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors, typography } from '../styles/commonStyles';

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={[typography.body, { color: colors.text, marginTop: 16 }]}>
      Initializing database...
    </Text>
  </View>
);

const RootLayout: React.FC = () => {
  const [isDbReady, setIsDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('Setting up error logging...');
        setupErrorLogging();
        
        console.log('Initializing database...');
        await initDatabase();
        
        console.log('App initialization completed');
        setIsDbReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setDbError(error instanceof Error ? error.message : 'Unknown error');
        // Still set as ready to allow app to function with fallback
        setIsDbReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isDbReady) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            {dbError && Platform.OS === 'web' && (
              <View style={{ 
                backgroundColor: '#FFF3CD', 
                padding: 8, 
                borderBottomWidth: 1, 
                borderBottomColor: '#FFEAA7' 
              }}>
                <Text style={{ textAlign: 'center', fontSize: 12, color: '#856404' }}>
                  Using web fallback mode: {dbError}
                </Text>
              </View>
            )}
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="recipe/[id]" />
            </Stack>
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
