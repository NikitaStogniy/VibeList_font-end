/**
 * Google Sign-In Configuration
 *
 * IMPORTANT: Before using Google Sign-In, you must:
 * 1. Create OAuth 2.0 Client IDs in Google Cloud Console
 * 2. Replace the placeholder values below with your actual Client IDs
 * 3. Update the iOS URL scheme in app.json
 * 4. Rebuild the app with `npx expo prebuild --clean`
 *
 * See GOOGLE_OAUTH_SETUP.md for detailed setup instructions.
 */

export const GOOGLE_SIGNIN_CONFIG = {
  /**
   * Web Client ID from Google Cloud Console
   * This is used by the backend to verify ID tokens
   * Format: '123456789012-abc123def456.apps.googleusercontent.com'
   *
   * TODO: Replace with your Web Client ID
   * To get this:
   * 1. Go to Google Cloud Console > APIs & Services > Credentials
   * 2. Create OAuth 2.0 Client ID (Web Application)
   * 3. Copy the Client ID
   */
  webClientId:
    "715346326745-3i5d6dntmt1tb2qb3e2826lficbdriga.apps.googleusercontent.com",

  /**
   * iOS Client ID from Google Cloud Console
   * Required for iOS authentication
   */
  iosClientId:
    "550787969367-jirqf2dror2h6n7nobui79f0lofiupk7.apps.googleusercontent.com",

  /**
   * Android Client ID (optional)
   * Only needed if you want to manually specify it
   * Usually auto-detected from google-services.json
   */
  // androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',

  /**
   * Request offline access to get refresh token
   * Set to true if you need to access Google APIs on behalf of the user
   */
  offlineAccess: false,

  /**
   * Scopes to request from Google
   * Default: profile and email
   */
  scopes: ["profile", "email"],
} as const;

/**
 * Check if Google Sign-In is properly configured
 */
export function isGoogleSignInConfigured(): boolean {
  return (
    !GOOGLE_SIGNIN_CONFIG.webClientId.includes("YOUR_") &&
    !GOOGLE_SIGNIN_CONFIG.iosClientId.includes("YOUR_")
  );
}

/**
 * Alternative: Firebase Auto-detection
 *
 * If you have Firebase configured with google-services.json (Android)
 * and GoogleService-Info.plist (iOS), you can use:
 *
 * export const GOOGLE_SIGNIN_CONFIG = {
 *   webClientId: 'autoDetect',
 *   iosClientId: 'autoDetect',
 *   offlineAccess: false,
 *   scopes: ['profile', 'email'],
 * } as const;
 */
