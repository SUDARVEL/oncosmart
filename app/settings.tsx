import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { SettingsRow } from '../components/settings/SettingsRow';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const resetApp = useAppStore((state) => state.resetApp);

  const handleMyProfile = () => {
    router.push('/onboarding/username?from=settings');
  };

  const handleTabPress = (tab: 'home' | 'growth' | 'settings') => {
    if (tab === 'home') router.replace('/home');
    if (tab === 'growth') router.replace('/growth');
  };

  const handleLogout = () => {
    resetApp();
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title={t('settings.title')}
        showBack
        largeTitle
        onBack={() => router.replace('/home')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <SettingsRow
          title={t('settings.myProfile')}
          description={t('settings.myProfileDescription')}
          showChevron
          onPress={handleMyProfile}
        />
        <SettingsRow
          title={t('settings.helpSupport')}
          description={t('settings.helpSupportDescription')}
          showChevron
        />
        <SettingsRow
          title={t('settings.logout')}
          description={t('settings.logoutDescription')}
          onPress={handleLogout}
        />
      </ScrollView>

      <Pressable style={styles.fab} accessibilityRole="button" accessibilityLabel="Chat">
        <Ionicons name="chatbubble" size={24} color={colors.buttonPrimary} />
      </Pressable>

      <BottomTabBar
        activeTab="settings"
        onTabPress={handleTabPress}
        labels={{
          home: t('home.tabHome'),
          growth: t('home.tabGrowth'),
          settings: t('home.tabSettings'),
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 8,
  },
  fab: {
    position: 'absolute',
    right: 9,
    bottom: 88,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tabBarBg,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
