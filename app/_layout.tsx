
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useEffect } from 'react';
import { setupErrorLogging } from '../utils/errorLogger';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { initDatabase } from '../utils/database';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  useEffect(() => {
    // Set up global error logging
    setupErrorLogging();
    
    // Initialize database
    initDatabase().catch(error => {
      console.error('Failed to initialize database:', error);
    });
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'default',
              }}
            />
          </GestureHandlerRootView>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
