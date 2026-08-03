import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, Platform } from 'react-native';

/**
 * Hardware back handler that is active only while the screen is focused.
 * Return true from `onBack` to consume the event.
 */
export function useAndroidBack(onBack: () => boolean): void {
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== 'android') return undefined;
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [onBack]),
  );
}
