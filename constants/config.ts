/**
 * Application Configuration
 *
 * Centralized configuration for API endpoints, environment settings,
 * and other app-wide constants.
 */

/**
 * Get API base URL from environment variables
 * Falls back to localhost for development if not set
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * Environment detection
 */
export const ENV = process.env.EXPO_PUBLIC_ENV || 'development';
export const IS_DEV = ENV === 'development';
export const IS_PROD = ENV === 'production';

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
} as const;

/**
 * Authentication Configuration
 */
export const AUTH_CONFIG = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user_data',
} as const;

/**
 * API Endpoints (relative to base URL)
 */
export const API_ENDPOINTS = {
  // Auth
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  me: '/auth/me',

  // Users
  users: '/users',
  searchUsers: '/users/search',
  followUser: (userId: string) => `/users/${userId}/follow`,
  userFollowers: (userId: string) => `/users/${userId}/followers`,
  userFollowing: (userId: string) => `/users/${userId}/following-list`,

  // Wishlist
  wishlist: '/wishlist',
  myItems: '/wishlist/my-items',
  userWishlist: (userId: string) => `/wishlist/user/${userId}`,
  reserveItem: (itemId: string) => `/wishlist/${itemId}/reserve`,
  parseUrl: '/wishlist/parse-url',

  // Feed
  feed: '/feed',
  trendingFeed: '/feed/trending',

  // Notifications
  notifications: '/notifications',
  unreadCount: '/notifications/unread-count',
  markRead: (notificationId: string) => `/notifications/${notificationId}/read`,
  markAllRead: '/notifications/mark-all-read',
  registerDevice: '/device-tokens/register',
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  defaultLimit: 20,
  defaultOffset: 0,
} as const;
