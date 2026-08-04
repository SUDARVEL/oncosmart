/**
 * Expo remote push registration is intentionally disabled for now.
 * Calling getExpoPushTokenAsync without Android FCM / google-services
 * can hard-crash some devices. Local update notifications still work via
 * expo-notifications scheduling in lib/appRefresh.ts.
 */
export async function registerExpoPushToken(_userId: string): Promise<string | null> {
  return null;
}

export async function requestAppUpdateBroadcast(_updateId: string): Promise<void> {
  // no-op until FCM credentials are configured for the project
}
