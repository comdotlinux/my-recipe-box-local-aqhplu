
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import recipesSlice from './slices/recipesSlice';
import uiSlice from './slices/uiSlice';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['ui'], // Only persist UI state, recipes are in SQLite
};

const rootReducer = combineReducers({
  recipes: recipesSlice,
  ui: uiSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
