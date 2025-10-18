# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeList is a social wishlist mobile application built with Expo and React Native. Users can create wishlists, follow other users, and reserve items from friends' wishlists to coordinate gift-giving.

## Key Development Commands

```bash
# Start development server
npm start
# or for specific platforms:
npm run ios
npm run android
npm run web

# Lint code
npm run lint

# Reset project (moves starter code to app-example/)
npm run reset-project
```

## Architecture

### File-Based Routing (Expo Router)

The app uses Expo Router for file-based navigation. Routes are defined by the file structure in the `app/` directory:

- `app/_layout.tsx` - Root layout with theme provider and Stack navigator
- `app/(tabs)/` - Tab-based navigation group
  - `app/(tabs)/_layout.tsx` - Tab bar configuration
  - `app/(tabs)/index.tsx` - Home feed tab
  - `app/(tabs)/explore.tsx` - Search/Explore tab
- `app/modal.tsx` - Modal screen example

**Navigation Structure**: The app will have 5 main sections in the tab bar:
1. Home Feed - view wishlist items from followed users
2. Search - discover and search for users
3. Add Item (center button) - opens bottom sheet for item creation
4. Notifications - activity updates
5. Profile - user account and personal wishlist

### Path Aliasing

The project uses `@/*` path aliases configured in `tsconfig.json`:
```typescript
import { Component } from '@/components/Component';
import { useHook } from '@/hooks/useHook';
import { Colors } from '@/constants/theme';
```

### Theme System

- Theming handled via `@react-navigation/native` ThemeProvider
- Color schemes defined in `constants/theme.ts` with `Colors` export
- Dark/light mode support using `useColorScheme()` hook from `hooks/use-color-scheme.ts`
- Platform-specific font definitions in `Fonts` export

### Component Organization

- `components/` - Reusable UI components
  - `components/ui/` - Base UI primitives (icon-symbol, collapsible, etc.)
  - Themed components (themed-text.tsx, themed-view.tsx) for consistent styling
- `hooks/` - Custom React hooks (color scheme, theme color)
- `constants/` - App-wide constants (theme colors, fonts)

### Technology Stack

- **Framework**: Expo SDK 54
- **React**: 19.1.0
- **React Native**: 0.81.4
- **Navigation**: Expo Router 6, React Navigation 7
- **State Management**: Redux Toolkit with RTK Query
- **Internationalization**: i18next with react-i18next
- **Animations**: React Native Reanimated 4.1
- **Gestures**: React Native Gesture Handler 2.28
- **Bottom Sheets**: @gorhom/bottom-sheet 5.2.6
- **TypeScript**: Strict mode enabled

## Expo Configuration

- **Scheme**: `vibelist` (deep linking)
- **New Architecture**: Enabled (`newArchEnabled: true`)
- **Experimental Features**:
  - Typed routes
  - React Compiler
- **Edge-to-edge display**: Enabled on Android
- **Platform Support**: iOS, Android, and Web (static output)

## Item Creation Feature

The app will support two methods for adding wishlist items:
1. **Link parsing**: Paste a product URL to auto-extract details
2. **Manual entry**: Fill fields (name, description, price, link, image)

## Item Reservation System

- Followers can mark wishlist items as "Reserved"
- Reservation status visible to all users viewing the item
- Prevents duplicate gift purchases

## State Management Architecture

### Redux Store Structure

The app uses Redux Toolkit with RTK Query for comprehensive state management:

**Store Configuration** (`store/index.ts`):
- **API slice** (`api.reducerPath`): RTK Query API endpoints with automatic caching
- **Auth slice** (`auth`): User authentication state (user, token, isAuthenticated)
- **UI slice** (`ui`): UI state (bottom sheets, loading, errors, toasts)
- **Settings slice** (`settings`): App settings (language preferences, notifications, etc.)

**Type-safe hooks exported from store**:
```typescript
import { useAppDispatch, useAppSelector } from '@/store';
```

### RTK Query API Layer

**API Slice** (`store/api.ts`):
- Currently uses `fakeBaseQuery` with mock data from `services/mockApi.ts`
- Fully typed endpoints with TypeScript interfaces from `types/api.ts`
- Automatic cache invalidation via tags: `User`, `Item`, `Follow`, `Notification`, `Feed`
- All API hooks auto-generated (e.g., `useGetFeedQuery`, `useCreateItemMutation`)

**API Endpoint Categories**:
- **Auth**: login, register, logout, getCurrentUser
- **Users**: getUser, searchUsers, updateProfile, getUserWishlist
- **Items**: getFeed, getItem, createItem, updateItem, deleteItem, reserveItem, unreserveItem
- **Follows**: followUser, unfollowUser, isFollowing
- **Notifications**: getNotifications, markAsRead, markAllAsRead
- **URL Parsing**: parseUrl (extracts product details from URLs)

**Migration Path**: To replace mock API with real backend, swap `fakeBaseQuery` for `fetchBaseQuery` in `store/api.ts` and update each endpoint from `queryFn` to `query`/`mutation`. See [API_INTEGRATION_GUIDE.md](API_INTEGRATION_GUIDE.md) for complete instructions.

### Context Providers

**BottomSheetContext** (`contexts/bottom-sheet-context.tsx`):
- Manages Add Item bottom sheet using `@gorhom/bottom-sheet`
- Provides `bottomSheetRef`, `openAddItemSheet()`, `closeAddItemSheet()`, and `toggleAddItemSheet()` functions
- Used in tab layout for center "+" button
- Uses ref-based API for programmatic control of bottom sheet

## Internationalization (i18n)

The app supports multiple languages using i18next:

**Configuration**: `i18n.ts` initializes i18next with device language detection
**Translation Files**: `locales/en.json`, `locales/es.json` (English and Spanish)
**Custom Hook**: `hooks/use-translation.ts` provides `useTranslation()` hook

**Usage in Components**:
```typescript
import { useTranslation } from '@/hooks/use-translation';

const { t, changeLanguage, language } = useTranslation();
<Text>{t('tabs.home')}</Text>
```

**Translation Key Structure**:
- `common.*` - Shared UI elements
- `tabs.*` - Tab bar labels
- `home.*`, `explore.*`, `profile.*`, `notifications.*`, `addItem.*` - Screen-specific
- `errors.*`, `actions.*` - Error and action labels

See [LOCALIZATION.md](LOCALIZATION.md) for adding new languages.

## Root Layout Structure

**App Layout** (`app/_layout.tsx`):
- Wraps entire app in Redux `Provider` with store
- Imports `@/i18n` to initialize internationalization
- Applies `ThemeProvider` from React Navigation with dark/light mode
- Uses Stack navigator with `(tabs)` group and modal screen

**Tab Layout** (`app/(tabs)/_layout.tsx`):
- Wraps tab navigator in `BottomSheetModalProvider` from `@gorhom/bottom-sheet` and `BottomSheetProvider` context
- Defines 5 tabs: home, explore, add-item (center), notifications, profile
- Settings screen hidden from tab bar (`href: null`)
- Center "Add Item" button triggers bottom sheet instead of navigation
- All tabs use `HapticTab` component for haptic feedback
- `AddItemBottomSheet` component rendered at root level for global access

## Development Notes

- Uses React Native Reanimated Worklets for performant animations
- Haptic feedback on tab interactions via `expo-haptics`
- Icon system uses SF Symbols on iOS (`expo-symbols` + IconSymbol component)
- Safe area handling with `react-native-safe-area-context`
- All user-facing strings must use translation keys via `t()` function
- API calls should use RTK Query hooks, never direct fetch/axios calls
- Bottom sheets use `@gorhom/bottom-sheet` library with ref-based control
- All UI components use native React Native primitives (View, Text, Pressable, TextInput, ScrollView) with custom theming
- No external UI libraries like Expo UI or NativeBase are used
