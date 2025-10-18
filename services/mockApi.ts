/**
 * Mock API Service
 *
 * This file contains mock implementations of all API endpoints.
 * All functions return promises with a 100ms delay to simulate network latency.
 *
 * To integrate with real API:
 * 1. Replace the mockDelay() calls with actual fetch/axios requests
 * 2. Update the endpoint URLs to point to your backend
 * 3. Keep all type signatures and return structures the same
 */

import type {
  User,
  WishlistItem,
  Notification,
  FeedItem,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateProfileRequest,
  SearchUsersRequest,
  SearchUsersResponse,
  CreateItemRequest,
  UpdateItemRequest,
  GetFeedRequest,
  GetFeedResponse,
  ReserveItemResponse,
  ParseUrlRequest,
  ParseUrlResponse,
  GetNotificationsRequest,
  GetNotificationsResponse,
} from '@/types/api';
import { ItemPriority, NotificationType } from '@/types/api';

// ============================================================================
// Mock Data Storage (simulates backend state)
// ============================================================================

let currentUser: User | null = null;

const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    displayName: 'John Doe',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    bio: 'Tech enthusiast and coffee lover',
    followersCount: 342,
    followingCount: 189,
    createdAt: new Date(2024, 0, 15).toISOString(),
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    displayName: 'Jane Smith',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    bio: 'Designer | Traveler | Book lover',
    followersCount: 567,
    followingCount: 234,
    createdAt: new Date(2024, 1, 20).toISOString(),
  },
  {
    id: '3',
    username: 'alex_jones',
    email: 'alex@example.com',
    displayName: 'Alex Jones',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    bio: 'Fitness & wellness coach',
    followersCount: 891,
    followingCount: 456,
    createdAt: new Date(2024, 2, 10).toISOString(),
  },
  {
    id: '4',
    username: 'sarah_wilson',
    email: 'sarah@example.com',
    displayName: 'Sarah Wilson',
    avatarUrl: 'https://i.pravatar.cc/150?img=20',
    bio: 'Foodie and chef',
    followersCount: 1234,
    followingCount: 567,
    createdAt: new Date(2024, 3, 5).toISOString(),
  },
];

const mockItems: WishlistItem[] = [
  {
    id: '1',
    userId: '2',
    name: 'Mechanical Keyboard',
    description: 'Cherry MX Brown switches, RGB backlight',
    price: 149.99,
    currency: 'USD',
    productUrl: 'https://example.com/keyboard',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
    isReserved: false,
    priority: ItemPriority.HIGH,
    createdAt: new Date(2025, 9, 1).toISOString(),
    updatedAt: new Date(2025, 9, 1).toISOString(),
  },
  {
    id: '2',
    userId: '2',
    name: 'Noise-Cancelling Headphones',
    description: 'Sony WH-1000XM5',
    price: 399.99,
    currency: 'USD',
    productUrl: 'https://example.com/headphones',
    imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=400',
    isReserved: true,
    reservedBy: '1',
    reservedAt: new Date(2025, 9, 10).toISOString(),
    priority: ItemPriority.MEDIUM,
    createdAt: new Date(2025, 8, 25).toISOString(),
    updatedAt: new Date(2025, 9, 10).toISOString(),
  },
  {
    id: '3',
    userId: '3',
    name: 'Yoga Mat',
    description: 'Eco-friendly, non-slip, 6mm thick',
    price: 45.00,
    currency: 'USD',
    imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    isReserved: false,
    priority: ItemPriority.LOW,
    createdAt: new Date(2025, 9, 5).toISOString(),
    updatedAt: new Date(2025, 9, 5).toISOString(),
  },
  {
    id: '4',
    userId: '4',
    name: 'Cast Iron Skillet',
    description: 'Lodge 12-inch pre-seasoned',
    price: 34.99,
    currency: 'USD',
    productUrl: 'https://example.com/skillet',
    imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    isReserved: false,
    priority: ItemPriority.MEDIUM,
    createdAt: new Date(2025, 9, 8).toISOString(),
    updatedAt: new Date(2025, 9, 8).toISOString(),
  },
];

const mockFollows: Set<string> = new Set(['2', '3', '4']); // Current user follows users 2, 3, 4

const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: NotificationType.NEW_FOLLOWER,
    actorId: '2',
    actorUsername: 'jane_smith',
    actorAvatarUrl: 'https://i.pravatar.cc/150?img=5',
    message: 'jane_smith started following you',
    isRead: false,
    createdAt: new Date(2025, 9, 12).toISOString(),
  },
  {
    id: '2',
    userId: '1',
    type: NotificationType.ITEM_RESERVED,
    actorId: '3',
    actorUsername: 'alex_jones',
    actorAvatarUrl: 'https://i.pravatar.cc/150?img=33',
    itemId: '1',
    itemName: 'Mechanical Keyboard',
    message: 'alex_jones reserved your Mechanical Keyboard',
    isRead: false,
    createdAt: new Date(2025, 9, 11).toISOString(),
  },
  {
    id: '3',
    userId: '1',
    type: NotificationType.NEW_ITEM,
    actorId: '4',
    actorUsername: 'sarah_wilson',
    actorAvatarUrl: 'https://i.pravatar.cc/150?img=20',
    itemId: '4',
    itemName: 'Cast Iron Skillet',
    message: 'sarah_wilson added a new item to their wishlist',
    isRead: true,
    createdAt: new Date(2025, 9, 8).toISOString(),
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

const mockDelay = (ms: number = 100): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================================================
// Auth API
// ============================================================================

export const mockLogin = async (credentials: LoginRequest): Promise<AuthResponse> => {
  await mockDelay();

  // Simulate authentication
  const user = mockUsers.find((u) => u.email === credentials.email);

  if (!user) {
    throw new Error('Invalid credentials');
  }

  currentUser = user;

  return {
    user,
    token: `mock-token-${user.id}`,
  };
};

export const mockRegister = async (data: RegisterRequest): Promise<AuthResponse> => {
  await mockDelay();

  // Check if username or email already exists
  if (mockUsers.some((u) => u.username === data.username || u.email === data.email)) {
    throw new Error('Username or email already exists');
  }

  const newUser: User = {
    id: generateId(),
    username: data.username,
    email: data.email,
    displayName: data.displayName,
    followersCount: 0,
    followingCount: 0,
    createdAt: new Date().toISOString(),
  };

  mockUsers.push(newUser);
  currentUser = newUser;

  return {
    user: newUser,
    token: `mock-token-${newUser.id}`,
  };
};

export const mockLogout = async (): Promise<void> => {
  await mockDelay();
  currentUser = null;
};

export const mockGetCurrentUser = async (): Promise<User> => {
  await mockDelay();

  if (!currentUser) {
    // For demo purposes, set a default current user
    currentUser = mockUsers[0];
  }

  return currentUser;
};

// ============================================================================
// Users API
// ============================================================================

export const mockGetUser = async (userId: string): Promise<User> => {
  await mockDelay();

  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const mockSearchUsers = async (params: SearchUsersRequest): Promise<SearchUsersResponse> => {
  await mockDelay();

  const { query, limit = 20, offset = 0 } = params;

  const filtered = mockUsers.filter((user) =>
    user.username.toLowerCase().includes(query.toLowerCase()) ||
    user.displayName.toLowerCase().includes(query.toLowerCase())
  );

  const paginated = filtered.slice(offset, offset + limit);

  return {
    users: paginated,
    total: filtered.length,
    hasMore: offset + limit < filtered.length,
  };
};

export const mockUpdateProfile = async (data: UpdateProfileRequest): Promise<User> => {
  await mockDelay();

  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  currentUser = {
    ...currentUser,
    ...data,
  };

  // Update in mockUsers array
  const index = mockUsers.findIndex((u) => u.id === currentUser!.id);
  if (index !== -1) {
    mockUsers[index] = currentUser;
  }

  return currentUser;
};

export const mockGetUserWishlist = async (userId: string): Promise<WishlistItem[]> => {
  await mockDelay();

  return mockItems.filter((item) => item.userId === userId);
};

// ============================================================================
// Wishlist Items API
// ============================================================================

export const mockGetFeed = async (params: GetFeedRequest): Promise<GetFeedResponse> => {
  await mockDelay();

  const { limit = 20, offset = 0 } = params;

  // Get items from followed users
  const feedItems = mockItems
    .filter((item) => mockFollows.has(item.userId))
    .map((item) => {
      const user = mockUsers.find((u) => u.id === item.userId)!;
      return {
        wishlistItem: item,
        user,
        isFollowing: true,
      };
    })
    .sort((a, b) => new Date(b.wishlistItem.createdAt).getTime() - new Date(a.wishlistItem.createdAt).getTime());

  const paginated = feedItems.slice(offset, offset + limit);

  return {
    items: paginated,
    total: feedItems.length,
    hasMore: offset + limit < feedItems.length,
  };
};

export const mockGetItem = async (itemId: string): Promise<WishlistItem> => {
  await mockDelay();

  const item = mockItems.find((i) => i.id === itemId);

  if (!item) {
    throw new Error('Item not found');
  }

  return item;
};

export const mockCreateItem = async (data: CreateItemRequest): Promise<WishlistItem> => {
  await mockDelay();

  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const newItem: WishlistItem = {
    id: generateId(),
    userId: currentUser.id,
    name: data.name,
    description: data.description,
    price: data.price,
    currency: data.currency,
    productUrl: data.productUrl,
    imageUrl: data.imageUrl,
    isReserved: false,
    priority: data.priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  mockItems.push(newItem);

  return newItem;
};

export const mockUpdateItem = async (itemId: string, data: UpdateItemRequest): Promise<WishlistItem> => {
  await mockDelay();

  const index = mockItems.findIndex((i) => i.id === itemId);

  if (index === -1) {
    throw new Error('Item not found');
  }

  mockItems[index] = {
    ...mockItems[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return mockItems[index];
};

export const mockDeleteItem = async (itemId: string): Promise<void> => {
  await mockDelay();

  const index = mockItems.findIndex((i) => i.id === itemId);

  if (index === -1) {
    throw new Error('Item not found');
  }

  mockItems.splice(index, 1);
};

export const mockReserveItem = async (itemId: string): Promise<ReserveItemResponse> => {
  await mockDelay();

  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const index = mockItems.findIndex((i) => i.id === itemId);

  if (index === -1) {
    throw new Error('Item not found');
  }

  if (mockItems[index].isReserved) {
    throw new Error('Item is already reserved');
  }

  mockItems[index] = {
    ...mockItems[index],
    isReserved: true,
    reservedBy: currentUser.id,
    reservedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Create notification for item owner
  const notification: Notification = {
    id: generateId(),
    userId: mockItems[index].userId,
    type: NotificationType.ITEM_RESERVED,
    actorId: currentUser.id,
    actorUsername: currentUser.username,
    actorAvatarUrl: currentUser.avatarUrl,
    itemId: itemId,
    itemName: mockItems[index].name,
    message: `${currentUser.username} reserved your ${mockItems[index].name}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  mockNotifications.unshift(notification);

  return {
    item: mockItems[index],
    notification,
  };
};

export const mockUnreserveItem = async (itemId: string): Promise<WishlistItem> => {
  await mockDelay();

  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  const index = mockItems.findIndex((i) => i.id === itemId);

  if (index === -1) {
    throw new Error('Item not found');
  }

  if (!mockItems[index].isReserved || mockItems[index].reservedBy !== currentUser.id) {
    throw new Error('Cannot unreserve this item');
  }

  mockItems[index] = {
    ...mockItems[index],
    isReserved: false,
    reservedBy: undefined,
    reservedAt: undefined,
    updatedAt: new Date().toISOString(),
  };

  return mockItems[index];
};

// ============================================================================
// Follows API
// ============================================================================

export const mockFollowUser = async (userId: string): Promise<void> => {
  await mockDelay();

  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  if (mockFollows.has(userId)) {
    throw new Error('Already following this user');
  }

  mockFollows.add(userId);

  // Update follower counts
  const targetUser = mockUsers.find((u) => u.id === userId);
  if (targetUser) {
    targetUser.followersCount++;
  }

  currentUser.followingCount++;
};

export const mockUnfollowUser = async (userId: string): Promise<void> => {
  await mockDelay();

  if (!currentUser) {
    throw new Error('Not authenticated');
  }

  if (!mockFollows.has(userId)) {
    throw new Error('Not following this user');
  }

  mockFollows.delete(userId);

  // Update follower counts
  const targetUser = mockUsers.find((u) => u.id === userId);
  if (targetUser) {
    targetUser.followersCount--;
  }

  currentUser.followingCount--;
};

export const mockIsFollowing = async (userId: string): Promise<boolean> => {
  await mockDelay();
  return mockFollows.has(userId);
};

// ============================================================================
// Notifications API
// ============================================================================

export const mockGetNotifications = async (params: GetNotificationsRequest): Promise<GetNotificationsResponse> => {
  await mockDelay();

  const { limit = 20, offset = 0, unreadOnly = false } = params;

  let filtered = mockNotifications;

  if (unreadOnly) {
    filtered = filtered.filter((n) => !n.isRead);
  }

  const paginated = filtered.slice(offset, offset + limit);
  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  return {
    notifications: paginated,
    total: filtered.length,
    unreadCount,
    hasMore: offset + limit < filtered.length,
  };
};

export const mockMarkNotificationAsRead = async (notificationId: string): Promise<Notification> => {
  await mockDelay();

  const index = mockNotifications.findIndex((n) => n.id === notificationId);

  if (index === -1) {
    throw new Error('Notification not found');
  }

  mockNotifications[index] = {
    ...mockNotifications[index],
    isRead: true,
  };

  return mockNotifications[index];
};

export const mockMarkAllNotificationsAsRead = async (): Promise<void> => {
  await mockDelay();

  mockNotifications.forEach((notification, index) => {
    mockNotifications[index] = { ...notification, isRead: true };
  });
};

// ============================================================================
// URL Parsing API
// ============================================================================

export const mockParseUrl = async (params: ParseUrlRequest): Promise<ParseUrlResponse> => {
  await mockDelay();

  // Simulate URL parsing (in real implementation, this would be a backend service)
  // For now, return mock data based on URL pattern

  if (params.url.includes('amazon')) {
    return {
      name: 'Sample Amazon Product',
      description: 'A great product from Amazon',
      price: 29.99,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      success: true,
    };
  }

  if (params.url.includes('ebay')) {
    return {
      name: 'Sample eBay Item',
      price: 45.00,
      currency: 'USD',
      imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
      success: true,
    };
  }

  // Generic response
  return {
    name: 'Product from URL',
    description: 'Extracted product information',
    success: true,
  };
};
