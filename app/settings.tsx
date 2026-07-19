import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { LanguageBottomSheet } from '../components/settings/LanguageBottomSheet';
import { ProfileBottomSheet } from '../components/settings/ProfileBottomSheet';
import { SettingsRow } from '../components/settings/SettingsRow';
import { cancelNextExerciseNotification } from '../lib/nextExerciseNotification';
import { openWhatsAppSupport } from '../lib/openWhatsAppSupport';
import { AppLanguage, useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const username = useAppStore((state) => state.username);
  const setUsername = useAppStore((state) => state.setUsername);
  const resetApp = useAppStore((state) => state.resetApp);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);

  const selectedLanguage: AppLanguage = language === 'ta' ? 'ta' : 'en';
  const languageLabel =
    selectedLanguage === 'ta' ? t('language.tamil') : t('language.english');
  const profileLabel = username.trim() || t('settings.myProfileDescription');

  const handleLanguageSelect = (next: AppLanguage) => {
    setLanguage(next);
    void i18n.changeLanguage(next);
    setLanguageSheetOpen(false);
  };

  const handleProfileSave = (nextUsername: string) => {
    setUsername(nextUsername);
    setProfileSheetOpen(false);
  };

  const handleTabPress = (tab: 'home' | 'growth' | 'settings') => {
    if (tab === 'home') router.replace('/home');
    if (tab === 'growth') router.replace('/growth');
  };

  const handleLogout = () => {
    void cancelNextExerciseNotification();
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
          description={profileLabel}
          showChevron
          onPress={() => setProfileSheetOpen(true)}
        />
        <SettingsRow
          title={t('settings.language')}
          description={languageLabel}
          showChevron
          onPress={() => setLanguageSheetOpen(true)}
        />
        <SettingsRow
          title={t('settings.helpSupport')}
          description={t('settings.helpSupportDescription')}
          showChevron
          onPress={openWhatsAppSupport}
        />
        <SettingsRow
          title={t('settings.logout')}
          description={t('settings.logoutDescription')}
          onPress={handleLogout}
        />
      </ScrollView>

      <ProfileBottomSheet
        visible={profileSheetOpen}
        username={username}
        onClose={() => setProfileSheetOpen(false)}
        onSave={handleProfileSave}
      />

      <LanguageBottomSheet
        visible={languageSheetOpen}
        selected={selectedLanguage}
        onClose={() => setLanguageSheetOpen(false)}
        onSelect={handleLanguageSelect}
      />

      <Pressable
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Chat"
        onPress={openWhatsAppSupport}
      >
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
