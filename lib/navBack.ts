import { router } from 'expo-router';
import { BackHandler, Platform } from 'react-native';

/** Pop the stack when possible; otherwise run the fallback. */
export function goBackOr(fallback: () => void): void {
  try {
    if (router.canGoBack()) {
      router.back();
      return;
    }
  } catch {
    // fall through
  }
  fallback();
}

/** Android hardware back: leave the app (Home root behavior). */
export function exitApp(): void {
  if (Platform.OS === 'android') {
    BackHandler.exitApp();
  }
}
