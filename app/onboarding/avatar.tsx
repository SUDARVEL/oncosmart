import { Asset } from 'expo-asset';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarCard } from '../../components/AvatarCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAndroidBack } from '../../hooks/useAndroidBack';
import { goBackOr } from '../../lib/navBack';
import { AppAvatar, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

/**
 * Opaque JPEG picker assets. Both cards stay mounted in every state
 * (none / male / female) so Android never blanks a sibling image.
 */
const MALE_PICKER = require('../../assets/avatars/male-avatar-picker.jpg');
const FEMALE_PICKER = require('../../assets/avatars/female-avatar-picker.jpg');

Asset.fromModule(MALE_PICKER).downloadAsync().catch(() => undefined);
Asset.fromModule(FEMALE_PICKER).downloadAsync().catch(() => undefined);

export default function AvatarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isFromHome = from === 'home';
  const isFromSettings = from === 'settings';
  const savedAvatar = useAppStore((state) => state.avatar);
  const setAvatar = useAppStore((state) => state.setAvatar);
  // Start from saved avatar only — allows the Figma "none selected" state.
  const [selected, setSelected] = useState<AppAvatar | null>(savedAvatar);

  const handleContinue = () => {
    if (!selected) return;
    setAvatar(selected);
    if (isFromHome) {
      router.replace('/home');
      return;
    }
    if (isFromSettings) {
      goBackOr(() => router.replace('/settings'));
      return;
    }
    router.replace('/onboarding/parq');
  };

  const handleBack = useCallback(() => {
    if (isFromHome) {
      goBackOr(() => router.replace('/home'));
      return;
    }
    if (isFromSettings) {
      goBackOr(() => router.replace('/settings'));
      return;
    }
    goBackOr(() => router.replace('/home'));
  }, [isFromHome, isFromSettings, router]);

  useAndroidBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack]),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title="" showBack onBack={handleBack} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.intro}>
          <Text style={styles.title}>{t('avatar.title')}</Text>
          <Text style={styles.subtitle}>{t('avatar.subtitle')}</Text>
        </View>

        <View style={styles.cardsRow} collapsable={false}>
          <AvatarCard
            imageKey="picker-male"
            image={MALE_PICKER}
            label={t('gender.male')}
            selected={selected === 'male'}
            onPress={() => setSelected('male')}
          />
          <AvatarCard
            imageKey="picker-female"
            image={FEMALE_PICKER}
            label={t('gender.female')}
            selected={selected === 'female'}
            onPress={() => setSelected('female')}
          />
        </View>

        <PrimaryButton
          label={t('avatar.saveContinue')}
          onPress={handleContinue}
          disabled={!selected}
          style={styles.button}
        />
      </ScrollView>
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
  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 20,
    gap: 12,
  },
  intro: {
    gap: 6,
  },
  title: {
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 14,
    ...font('medium'),
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
  },
  button: {
    marginTop: 16,
  },
});
