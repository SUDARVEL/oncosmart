import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { LanguageCard } from '../components/LanguageCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { SettingsRow } from '../components/settings/SettingsRow';
import { openWhatsAppSupport } from '../lib/openWhatsAppSupport';
import { AppLanguage, useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const resetApp = useAppStore((state) => state.resetApp);

  const selectedLanguage: AppLanguage = language === 'ta' ? 'ta' : 'en';

  const handleMyProfile = () => {
    router.push('/onboarding/username?from=settings');
  };

  const handleLanguageChange = (next: AppLanguage) => {
    setLanguage(next);
    void i18n.changeLanguage(next);
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

        <View style={styles.languageSection}>
          <Text style={styles.languageTitle}>{t('settings.language')}</Text>
          <Text style={styles.languageDescription}>
            {t('settings.languageDescription')}
          </Text>
          <View style={styles.languageCards}>
            <LanguageCard
              label={t('language.english')}
              glyph="Aa"
              selected={selectedLanguage === 'en'}
              onPress={() => handleLanguageChange('en')}
            />
            <LanguageCard
              label={t('language.tamil')}
              glyph="த"
              selected={selectedLanguage === 'ta'}
              onPress={() => handleLanguageChange('ta')}
            />
          </View>
        </View>

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
    gap: 16,
  },
  languageSection: {
    width: '100%',
    gap: 8,
  },
  languageTitle: {
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1E1E1E',
    ...font('regular'),
  },
  languageDescription: {
    fontSize: 16,
    lineHeight: 22.4,
    color: '#757575',
    ...font('regular'),
  },
  languageCards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
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
