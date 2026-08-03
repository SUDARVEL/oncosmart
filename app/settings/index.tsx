import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../../components/BottomTabBar';
import { ChatFab } from '../../components/ChatFab';
import { CoachMarkOverlay } from '../../components/coach/CoachMarkOverlay';
import { ScreenHeader } from '../../components/ScreenHeader';
import { LanguageBottomSheet } from '../../components/settings/LanguageBottomSheet';
import { ProfileBottomSheet } from '../../components/settings/ProfileBottomSheet';
import { SettingsRow } from '../../components/settings/SettingsRow';
import { useAndroidBack } from '../../hooks/useAndroidBack';
import { useCoachTour } from '../../hooks/useCoachTour';
import { signOut } from '../../lib/auth';
import { goBackOr } from '../../lib/navBack';
import { cancelNextExerciseNotification } from '../../lib/nextExerciseNotification';
import { openWhatsAppSupport } from '../../lib/openWhatsAppSupport';
import { setPreferredLanguage } from '../../lib/preferredLanguage';
import { saveCloudProfileFromStore } from '../../lib/userCloudSync';
import { AppLanguage, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const username = useAppStore((state) => state.username);
  const setUsername = useAppStore((state) => state.setUsername);
  const resetApp = useAppStore((state) => state.resetApp);
  const restartCoachTour = useAppStore((state) => state.restartCoachTour);
  const [languageSheetOpen, setLanguageSheetOpen] = useState(false);
  const [profileSheetOpen, setProfileSheetOpen] = useState(false);
  const {
    active: coachActive,
    step: coachStep,
    stepIndex: coachStepIndex,
    stepCount: coachStepCount,
    rect: coachRect,
    registerHost,
    registerTarget,
    next: coachNext,
    skip: coachSkip,
  } = useCoachTour('settings');

  const selectedLanguage: AppLanguage = language === 'ta' ? 'ta' : 'en';
  const languageLabel =
    selectedLanguage === 'ta' ? t('language.tamil') : t('language.english');
  const profileLabel = username.trim() || t('settings.myProfileDescription');
  const appVersion =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    '1.0.0';

  const handleLanguageSelect = (next: AppLanguage) => {
    setLanguage(next);
    void setPreferredLanguage(next);
    void i18n.changeLanguage(next);
    setLanguageSheetOpen(false);
  };

  const handleProfileSave = (nextUsername: string) => {
    setUsername(nextUsername);
    setProfileSheetOpen(false);
  };

  const handleTabPress = (tab: 'home' | 'growth' | 'settings') => {
    if (tab === 'home') router.replace('/home');
    if (tab === 'growth') router.push('/growth');
  };

  const handleBack = useCallback(() => {
    goBackOr(() => router.replace('/home'));
  }, [router]);

  useAndroidBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack]),
  );

  const handleLogout = () => {
    const state = useAppStore.getState();
    const keptLanguage = state.language;
    const userId = state.activeAuthUserId;
    void (async () => {
      if (userId) {
        await saveCloudProfileFromStore(userId);
      }
      await cancelNextExerciseNotification();
      await signOut();
      resetApp();
      if (keptLanguage) useAppStore.getState().setLanguage(keptLanguage);
      router.replace('/language');
    })();
  };

  return (
    <View
      style={styles.screen}
      ref={(node) => registerHost(node)}
      collapsable={false}
    >
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScreenHeader
        title={t('settings.title')}
        showBack
        onBack={handleBack}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          ref={(node) => registerTarget('settings.menu', node)}
          collapsable={false}
          style={styles.menuAnchor}
        >
          <SettingsRow
            title={t('settings.myProfile')}
            description={profileLabel}
            showChevron
            onPress={() => setProfileSheetOpen(true)}
          />
          <SettingsRow
            title={t('settings.changeAvatar')}
            description={t('settings.changeAvatarDescription')}
            showChevron
            onPress={() => router.push('/onboarding/avatar?from=settings')}
          />
          <SettingsRow
            title={t('settings.language')}
            description={languageLabel}
            showChevron
            onPress={() => setLanguageSheetOpen(true)}
          />
          <SettingsRow
            title={t('settings.changePassword')}
            description={t('settings.changePasswordDescription')}
            showChevron
            onPress={() => router.push('/settings/change-password')}
          />
          <SettingsRow
            title={t('settings.helpSupport')}
            description={t('settings.helpSupportDescription')}
            showChevron
            onPress={openWhatsAppSupport}
          />
          <SettingsRow
            title={t('settings.replayTips')}
            description={t('settings.replayTipsDescription')}
            showChevron
            onPress={() => {
              restartCoachTour();
              router.replace('/home');
            }}
          />
          <SettingsRow
            title={t('settings.about')}
            description={t('settings.aboutDescription', { version: appVersion })}
          />
          <SettingsRow
            title={t('settings.logout')}
            description={t('settings.logoutDescription')}
            onPress={handleLogout}
          />
        </View>
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

      <ChatFab bottom={96} />

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
      {coachActive && coachStep ? (
        <CoachMarkOverlay
          visible
          title={t(coachStep.titleKey)}
          body={t(coachStep.bodyKey)}
          icon={coachStep.icon}
          stepIndex={coachStepIndex}
          stepCount={coachStepCount}
          target={coachRect}
          preferPlacement={coachStep.preferPlacement}
          spotlight={coachStep.spotlight}
          pad={coachStep.pad}
          onNext={coachNext}
          onSkip={coachSkip}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 100,
    alignItems: 'stretch',
    width: '100%',
  },
  menuAnchor: {
    width: '100%',
    alignSelf: 'stretch',
  },
});
