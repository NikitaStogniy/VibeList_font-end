import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User } from '@/types/api';
import { api } from '../api';
import {
  saveAuthToken,
  saveRefreshToken,
  saveUserData,
  clearAuthData,
} from '@/utils/secureStorage';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true, // Start as loading to check for persisted auth
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Persist to secure storage
      saveAuthToken(action.payload.token);
      if (action.payload.refreshToken) {
        saveRefreshToken(action.payload.refreshToken);
      }
      saveUserData(action.payload.user);
    },
    clearCredentials: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Clear secure storage
      clearAuthData();
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update persisted user data
        saveUserData(state.user);
      }
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    restoreCredentials: (state, action: PayloadAction<{ user: User; token: string; refreshToken?: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // Handle login mutation
    builder.addMatcher(
      api.endpoints.login.matchFulfilled,
      (state, action) => {
        console.log('[AuthSlice] Login - full payload:', JSON.stringify(action.payload, null, 2));
        console.log('[AuthSlice] Login - token types:', {
          tokenType: typeof action.payload.token,
          refreshTokenType: typeof action.payload.refreshToken,
          userType: typeof action.payload.user,
        });

        // Validate that we have the required data
        if (!action.payload.token || !action.payload.user) {
          console.error('[AuthSlice] Login - Missing required auth data!', {
            hasToken: !!action.payload.token,
            hasUser: !!action.payload.user,
            payload: action.payload,
          });
          return;
        }

        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.isLoading = false;

        // Persist to secure storage
        saveAuthToken(action.payload.token);
        if (action.payload.refreshToken) {
          saveRefreshToken(action.payload.refreshToken);
        }
        saveUserData(action.payload.user);
      }
    );
    // Handle register mutation
    builder.addMatcher(
      api.endpoints.register.matchFulfilled,
      (state, action) => {
        console.log('[AuthSlice] Register - full payload:', JSON.stringify(action.payload, null, 2));
        console.log('[AuthSlice] Register - token types:', {
          tokenType: typeof action.payload.token,
          refreshTokenType: typeof action.payload.refreshToken,
          userType: typeof action.payload.user,
        });

        // Validate that we have the required data
        if (!action.payload.token || !action.payload.user) {
          console.error('[AuthSlice] Register - Missing required auth data!', {
            hasToken: !!action.payload.token,
            hasUser: !!action.payload.user,
            payload: action.payload,
          });
          return;
        }

        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.isAuthenticated = true;
        state.isLoading = false;

        // Persist to secure storage
        saveAuthToken(action.payload.token);
        if (action.payload.refreshToken) {
          saveRefreshToken(action.payload.refreshToken);
        }
        saveUserData(action.payload.user);
      }
    );
    // Handle logout mutation
    builder.addMatcher(
      api.endpoints.logout.matchFulfilled,
      (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;

        // Clear secure storage
        clearAuthData();
      }
    );
    // Handle getCurrentUser query
    builder.addMatcher(
      api.endpoints.getCurrentUser.matchFulfilled,
      (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      }
    );
    // Handle updateProfile mutation
    builder.addMatcher(
      api.endpoints.updateProfile.matchFulfilled,
      (state, action) => {
        state.user = action.payload;
      }
    );
  },
});

export const {
  setCredentials,
  clearCredentials,
  updateUser,
  setAuthLoading,
  restoreCredentials,
} = authSlice.actions;

export default authSlice.reducer;
