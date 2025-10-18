import {
  createApi,
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./index";
import type {
  User,
  WishlistItem,
  Notification,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
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
} from "@/types/api";
import { API_CONFIG } from "@/constants/config";
import {
  getRefreshToken,
  saveAuthToken,
  saveRefreshToken,
  clearAuthData,
} from "@/utils/secureStorage";

/**
 * Backend Response Wrapper
 * The API Gateway wraps all responses in this format via TransformMiddleware
 */
interface BackendResponse<T> {
  success: boolean;
  requestId?: string;
  timestamp?: string;
  data?: T;
  error?: any;
}

/**
 * Mutex to prevent multiple simultaneous token refresh requests
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

/**
 * Custom base query that unwraps backend response wrapper
 * and handles token injection
 */
const baseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const token = (getState() as RootState).auth.token;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Set content type
    headers.set("Content-Type", "application/json");

    return headers;
  },
});

/**
 * Base query with response transformation and automatic token refresh
 * Unwraps the backend's { success, requestId, timestamp, data } wrapper and handles 401 errors
 */
const baseQueryWithTransform: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait if a refresh is already in progress
  if (isRefreshing) {
    console.log("[API] Waiting for token refresh to complete...");
    await new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  let result = await baseQuery(args, api, extraOptions);

  // Debug logging
  // console.log('[API] Raw response:', JSON.stringify(result, null, 2));

  // Handle 401 Unauthorized - Token expired or invalid
  if (result.error && result.error.status === 401) {
    const state = api.getState() as RootState;
    const currentRefreshToken = state.auth.refreshToken;

    console.log("[API] Got 401 error, attempting token refresh...");

    // Skip refresh for login/register/refresh endpoints
    const url = typeof args === "string" ? args : args.url;
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh")
    ) {
      console.log("[API] Skipping refresh for auth endpoint");
      return result;
    }

    // If no refresh token available, logout immediately
    if (!currentRefreshToken) {
      console.log("[API] No refresh token available, logging out...");
      // Dynamically import to avoid circular dependency
      const { clearCredentials } = await import("./slices/authSlice");
      api.dispatch(clearCredentials());
      await clearAuthData();
      return result;
    }

    // If not already refreshing, start refresh process
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        console.log("[API] Calling refresh token endpoint...");

        // Call refresh endpoint directly
        const refreshResult = await baseQuery(
          {
            url: "/auth/refresh",
            method: "POST",
            body: { refreshToken: currentRefreshToken },
          },
          api,
          extraOptions
        );

        if (refreshResult.data) {
          // Unwrap the refresh response
          let refreshData = refreshResult.data;
          if (
            refreshData &&
            typeof refreshData === "object" &&
            "data" in refreshData
          ) {
            const backendResponse = refreshData as BackendResponse<any>;
            refreshData = backendResponse.data;
          }

          const { accessToken, refreshToken: newRefreshToken } =
            refreshData as RefreshTokenResponse;

          console.log("[API] Token refresh successful, updating tokens...");

          // Save new tokens
          await saveAuthToken(accessToken);
          await saveRefreshToken(newRefreshToken);

          // Update Redux state
          const currentUser = state.auth.user;
          if (currentUser) {
            // Dynamically import to avoid circular dependency
            const { setCredentials } = await import("./slices/authSlice");
            api.dispatch(
              setCredentials({
                user: currentUser,
                token: accessToken,
                refreshToken: newRefreshToken,
              })
            );
          }

          // Process queued requests
          processQueue();
          isRefreshing = false;

          // Retry the original request with new token
          console.log("[API] Retrying original request with new token...");
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed
          console.log("[API] Token refresh failed, logging out...");
          processQueue(new Error("Token refresh failed"));
          isRefreshing = false;
          // Dynamically import to avoid circular dependency
          const { clearCredentials } = await import("./slices/authSlice");
          api.dispatch(clearCredentials());
          await clearAuthData();
          return result;
        }
      } catch (error) {
        console.error("[API] Token refresh error:", error);
        processQueue(error);
        isRefreshing = false;
        // Dynamically import to avoid circular dependency
        const { clearCredentials } = await import("./slices/authSlice");
        api.dispatch(clearCredentials());
        await clearAuthData();
        return result;
      }
    }
  }

  // If error (non-401), return as-is
  if (result.error) {
    return result;
  }

  let unwrappedData = result.data;

  // Unwrap backend response wrapper if present
  // The backend wraps responses in: { success, requestId, timestamp, data }
  if (
    unwrappedData &&
    typeof unwrappedData === "object" &&
    "data" in unwrappedData
  ) {
    const backendResponse = unwrappedData as BackendResponse<any>;
    unwrappedData = backendResponse.data;
    console.log("[API] Unwrapped response:", JSON.stringify(unwrappedData, null, 2));

    return {
      ...result,
      data: unwrappedData,
    };
  }

  console.log("[API] No unwrapping needed, returning as-is");
  return result;
};

/**
 * RTK Query API Definition
 *
 * Integrated with real NestJS backend services.
 * Features:
 * - Automatic JWT token injection
 * - Response unwrapping (removes backend wrapper)
 * - Automatic cache invalidation
 * - Type-safe endpoints
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithTransform,
  tagTypes: ["User", "Item", "Follow", "Notification", "Feed"],
  endpoints: (builder) => ({
    // ========================================================================
    // Auth Endpoints
    // ========================================================================
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Feed"],
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["User", "Feed", "Item", "Notification"],
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: "/auth/refresh",
        method: "POST",
        body: data,
      }),
    }),

    getCurrentUser: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    // ========================================================================
    // Users Endpoints
    // ========================================================================
    getUser: builder.query<User, string>({
      query: (userId) => `/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: "User", id: userId }],
    }),

    searchUsers: builder.query<SearchUsersResponse, SearchUsersRequest>({
      query: (params) => ({
        url: "/users/search",
        params: { query: params.query },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "SEARCH" },
            ]
          : [{ type: "User", id: "SEARCH" }],
    }),

    updateProfile: builder.mutation<User, UpdateProfileRequest>({
      query: (data) => ({
        url: "/users/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getUserWishlist: builder.query<WishlistItem[], string>({
      query: (userId) => `/wishlist/user/${userId}`,
      transformResponse: (response: {
        items: WishlistItem[];
        total: number;
        hasMore: boolean;
      }) => response.items,
      providesTags: (result, error, userId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Item" as const, id })),
              { type: "Item", id: `USER-${userId}` },
            ]
          : [{ type: "Item", id: `USER-${userId}` }],
    }),

    getMyWishlist: builder.query<WishlistItem[], void>({
      query: () => "/wishlist/my-items",
      transformResponse: (response: {
        items: WishlistItem[];
        total: number;
        hasMore: boolean;
      }) => response.items,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Item" as const, id })),
              { type: "Item", id: "MY-ITEMS" },
            ]
          : [{ type: "Item", id: "MY-ITEMS" }],
    }),

    // ========================================================================
    // Wishlist Items Endpoints
    // ========================================================================
    getFeed: builder.query<GetFeedResponse, GetFeedRequest>({
      query: (params) => ({
        url: "/feed",
        params: {
          limit: params.limit,
          offset: params.offset,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ wishlistItem }) => ({
                type: "Item" as const,
                id: wishlistItem.id,
              })),
              { type: "Feed", id: "LIST" },
            ]
          : [{ type: "Feed", id: "LIST" }],
    }),

    getItem: builder.query<WishlistItem, string>({
      query: (itemId) => `/wishlist/${itemId}`,
      providesTags: (result, error, itemId) => [{ type: "Item", id: itemId }],
    }),

    createItem: builder.mutation<WishlistItem, CreateItemRequest>({
      query: (data) => ({
        url: "/wishlist",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Item", "Feed"],
    }),

    updateItem: builder.mutation<
      WishlistItem,
      { itemId: string; data: UpdateItemRequest }
    >({
      query: ({ itemId, data }) => ({
        url: `/wishlist/${itemId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { itemId }) => [
        { type: "Item", id: itemId },
        { type: "Feed", id: "LIST" },
      ],
    }),

    deleteItem: builder.mutation<void, string>({
      query: (itemId) => ({
        url: `/wishlist/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, itemId) => [
        { type: "Item", id: itemId },
        { type: "Feed", id: "LIST" },
      ],
    }),

    reserveItem: builder.mutation<ReserveItemResponse, string>({
      query: (itemId) => ({
        url: `/wishlist/${itemId}/reserve`,
        method: "POST",
      }),
      invalidatesTags: (result, error, itemId) => [
        { type: "Item", id: itemId },
        { type: "Feed", id: "LIST" },
        { type: "Notification", id: "LIST" },
      ],
    }),

    unreserveItem: builder.mutation<WishlistItem, string>({
      query: (itemId) => ({
        url: `/wishlist/${itemId}/reserve`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, itemId) => [
        { type: "Item", id: itemId },
        { type: "Feed", id: "LIST" },
      ],
    }),

    // ========================================================================
    // Follow Endpoints
    // ========================================================================
    followUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: "POST",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "User", id: userId },
        { type: "Follow", id: userId },
        { type: "Feed", id: "LIST" },
      ],
    }),

    unfollowUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, userId) => [
        { type: "User", id: userId },
        { type: "Follow", id: userId },
        { type: "Feed", id: "LIST" },
      ],
    }),

    isFollowing: builder.query<boolean, string>({
      query: (userId) => `/users/${userId}/following`,
      transformResponse: (response: { isFollowing: boolean }) =>
        response.isFollowing,
      providesTags: (result, error, userId) => [{ type: "Follow", id: userId }],
    }),

    // ========================================================================
    // Notifications Endpoints
    // ========================================================================
    getNotifications: builder.query<
      GetNotificationsResponse,
      GetNotificationsRequest
    >({
      query: (params) => ({
        url: "/notifications",
        params: {
          limit: params.limit,
          offset: params.offset,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.notifications.map(({ id }) => ({
                type: "Notification" as const,
                id,
              })),
              { type: "Notification", id: "LIST" },
            ]
          : [{ type: "Notification", id: "LIST" }],
    }),

    markNotificationAsRead: builder.mutation<Notification, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, notificationId) => [
        { type: "Notification", id: notificationId },
        { type: "Notification", id: "LIST" },
      ],
    }),

    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Notification", id: "LIST" }],
    }),

    // ========================================================================
    // URL Parsing Endpoint
    // ========================================================================
    parseUrl: builder.mutation<ParseUrlResponse, ParseUrlRequest>({
      query: (params) => ({
        url: "/wishlist/parse-url",
        method: "POST",
        body: params,
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery,
  useLazyGetCurrentUserQuery,
  // Users
  useGetUserQuery,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useUpdateProfileMutation,
  useGetUserWishlistQuery,
  useGetMyWishlistQuery,
  // Items
  useGetFeedQuery,
  useGetItemQuery,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useReserveItemMutation,
  useUnreserveItemMutation,
  // Follows
  useFollowUserMutation,
  useUnfollowUserMutation,
  useIsFollowingQuery,
  // Notifications
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  // URL Parsing
  useParseUrlMutation,
} = api;
