// ============================================================================
// Core Entity Types
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  createdAt: string; // ISO date string
}

export interface WishlistItem {
  id: string;
  userId: string; // Owner of the item
  name?: string; // Optional - can be filled after URL parsing
  description?: string;
  price?: number;
  currency?: string; // e.g., "USD", "EUR"
  productUrl?: string;
  imageUrl?: string;
  isPublic?: boolean; // Whether the item is visible to others
  isReserved: boolean;
  reservedBy?: string; // userId who reserved it
  reservedAt?: string; // ISO date string
  priority?: ItemPriority;
  // URL parsing and price monitoring fields
  parsingEnabled?: boolean; // If true, price is monitored for changes
  lastParsedAt?: string; // ISO date string - last price check
  parsingFailedCount?: number; // Number of failed parsing attempts
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface Follow {
  id: string;
  followerId: string; // User who is following
  followingId: string; // User being followed
  createdAt: string; // ISO date string
}

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: NotificationType;
  actorId: string; // User who triggered the notification
  actorUsername?: string; // For display purposes
  actorAvatarUrl?: string; // For display purposes
  itemId?: string; // Related wishlist item (if applicable)
  itemName?: string; // For display purposes
  message: string;
  isRead: boolean;
  createdAt: string; // ISO date string
  // Price drop specific fields
  oldPrice?: number;
  newPrice?: number;
  currency?: string;
  discountPercent?: number;
  ownerId?: string; // Owner of the item for price drop notifications
}

export interface FeedItem {
  wishlistItem: WishlistItem;
  user: User; // Owner of the item
  isFollowing: boolean;
}

// ============================================================================
// Enums
// ============================================================================

export enum ItemPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationType {
  NEW_FOLLOWER = 'new_follower',
  ITEM_RESERVED = 'item_reserved',
  ITEM_UNRESERVED = 'item_unreserved',
  NEW_ITEM = 'new_item',
  PRICE_DROP = 'price_drop',
}

// ============================================================================
// Request/Response Types
// ============================================================================

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string; // JWT refresh token for token renewal
}

export interface AppleAuthRequest {
  identityToken: string;
  user?: string; // Optional JSON string with firstName and lastName, only on first sign-in
}

export interface GoogleAuthRequest {
  idToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Users
export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface SearchUsersRequest {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchUsersResponse {
  users: User[];
  total: number;
  hasMore: boolean;
}

// Wishlist Items
export interface CreateItemRequest {
  name?: string; // Optional when productUrl is provided
  description?: string;
  price?: number;
  currency?: string;
  productUrl?: string;
  imageUrl?: string;
  priority?: ItemPriority;
  isPublic?: boolean; // Whether the item is visible to others (default: true)
}

export interface CreateItemResponse {
  item: WishlistItem;
  warnings?: string[]; // List of fields that couldn't be parsed
}

export interface UpdateItemRequest {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  productUrl?: string;
  imageUrl?: string;
  priority?: ItemPriority;
  isPublic?: boolean;
}

export interface GetFeedRequest {
  limit?: number;
  offset?: number;
}

export interface GetFeedResponse {
  items: FeedItem[];
  total: number;
  hasMore: boolean;
}

export interface ReserveItemResponse extends WishlistItem {
  // Backend returns WishlistItem directly for now
  // In the future, this can be expanded to include notification
}

// URL Parsing
export interface ParseUrlRequest {
  url: string;
}

export interface ParseUrlResponse {
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  success: boolean;
}

// Notifications
export interface GetNotificationsRequest {
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}

export interface GetNotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  hasMore: boolean;
}

// ============================================================================
// Generic API Response Wrapper
// ============================================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
