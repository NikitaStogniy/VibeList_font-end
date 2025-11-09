# Configuration Constants

This directory contains configuration files for various features of the VibeList app.

## google-signin-config.ts

Configuration for Google Sign-In authentication.

**Status:** ⚠️ NOT CONFIGURED

To enable Google Sign-In:

1. Follow the setup guide in [GOOGLE_OAUTH_SETUP.md](../GOOGLE_OAUTH_SETUP.md)
2. Get your Client IDs from Google Cloud Console
3. Update the values in [google-signin-config.ts](./google-signin-config.ts)

**What to update:**
```typescript
export const GOOGLE_SIGNIN_CONFIG = {
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // ← Replace this
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // ← Replace this
  offlineAccess: false,
  scopes: ['profile', 'email'],
} as const;
```

The Google Sign-In button will only appear in the app after this configuration is complete.

---

For more configuration files, see individual files in this directory.
