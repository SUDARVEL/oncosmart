import '../i18n';

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
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { isSupabaseConfigured } from '../lib/env';
import { checkSupabaseConnection } from '../lib/supabase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_600SemiBold,
    Roboto_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="home" />
        <Stack.Screen name="exercise/[day]" />
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
