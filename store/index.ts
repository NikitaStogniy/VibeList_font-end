import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import settingsReducer from './settings-slice';

// Persist configuration
const persistConfig = {
  key: 'root',
  version: 1,
  storage: AsyncStorage,
  // Whitelist: only persist these reducers
  whitelist: ['auth', 'settings'],
  // Blacklist: don't persist these reducers
  blacklist: ['ui'],
};

// API persist configuration - persist cache for offline support
const apiPersistConfig = {
  key: 'api',
  version: 1,
  storage: AsyncStorage,
  // Only persist successful query results, not pending states
  whitelist: ['queries'],
  // Cache TTL: 1 hour
  timeout: 3600000,
};

// Combine reducers
const rootReducer = combineReducers({
  [api.reducerPath]: persistReducer(apiPersistConfig, api.reducer),
  auth: authReducer,
  ui: uiReducer,
  settings: settingsReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  // Adding the api middleware enables caching, invalidation, polling, and other features of RTK Query
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types from redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

// Create persistor
export const persistor = persistStore(store);

// Optional: Setup listeners for refetchOnFocus and refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export pre-typed hooks for use throughout the app
import { useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
