import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SplashFooter } from '../components/SplashFooter';
import { colors } from '../theme/colors';

const SPLASH_DURATION_MS = 3000;

export default function SplashScreen() {
  const router = useRouter();

  const goToOnboarding = useCallback(() => {
    router.replace('/onboarding');
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(goToOnboarding, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [goToOnboarding]);

  return (
    <Pressable style={styles.pressable} onPress={goToOnboarding} accessibilityRole="button">
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerContent}>
          <Image
            source={require('../assets/splash/oncosmart-logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
        </View>
        <SplashFooter />
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  logo: {
    width: 116,
    height: 185,
  },
});
