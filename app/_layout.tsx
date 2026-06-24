import '../i18n';

import {
  Antonio_700Bold,
} from '@expo-google-fonts/antonio';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_600SemiBold,
  Roboto_700Bold,
  useFonts,
} from '@expo-google-fonts/roboto';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { isSupabaseConfigured } from '../lib/env';
import { checkSupabaseConnection } from '../lib/supabase';
import { colors } from '../theme/colors';

SplashScreen.preventAutoHideAsync();

const FONT_LOAD_TIMEOUT_MS = Platform.OS === 'web' ? 2000 : 8000;

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
    Antonio_700Bold,
  });
  const [fontTimedOut, setFontTimedOut] = useState(false);

  const appReady = fontsLoaded || fontError != null || fontTimedOut;

  useEffect(() => {
    const timeout = setTimeout(() => setFontTimedOut(true), FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (appReady) {
      void SplashScreen.hideAsync();
    }
  }, [appReady]);

  useEffect(() => {
    if (fontError) {
      console.warn('[Fonts] Failed to load custom fonts, using system fallbacks.', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (!__DEV__) return;
    if (!isSupabaseConfigured()) {
      console.log('[Supabase] Add .env from .env.example to connect (see SUPABASE_SETUP.md)');
      return;
    }
    void checkSupabaseConnection().then((ok) => {
      console.log(`[Supabase] Storage connection: ${ok ? 'OK' : 'check bucket name and keys'}`);
    });
  }, []);

  if (!appReady) {
    return (
      <View style={styles.bootScreen}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="home" />
        <Stack.Screen name="exercise/[day]" />
        <Stack.Screen name="exercise/sessions/[day]" />
        <Stack.Screen
          name="exercise/pain-score"
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="growth" />
        <Stack.Screen name="settings" />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
