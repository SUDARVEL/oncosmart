import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarCard } from '../../components/AvatarCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { AppAvatar, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

// Keep requires at module scope and wire each card to exactly one asset.
const MALE_AVATAR = require('../../assets/avatars/male-avatar.png');
const FEMALE_AVATAR = require('../../assets/avatars/female-avatar.png');

export default function AvatarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const isFromHome = from === 'home';
  const savedAvatar = useAppStore((state) => state.avatar);
  const gender = useAppStore((state) => state.gender);
  const setAvatar = useAppStore((state) => state.setAvatar);
  const [selected, setSelected] = useState<AppAvatar | null>(savedAvatar);

  useEffect(() => {
    if (selected || !gender) return;
    if (gender === 'male') setSelected('male');
    if (gender === 'female') setSelected('female');
  }, [gender, selected]);

  const handleContinue = () => {
    if (!selected) return;
    setAvatar(selected);
    if (isFromHome) {
      router.replace('/home');
      return;
    }
    router.replace('/onboarding/parq');
  };

  const handleBack = () => {
    if (isFromHome) {
      router.replace('/home');
      return;
    }
    router.back();
  };

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

        <View style={styles.cardsRow}>
          {/* Left = Male only. Right = Female only. Sources never cross. */}
          <AvatarCard
            key="card-male"
            image={MALE_AVATAR}
            imageKey="male"
            label={t('gender.male')}
            selected={selected === 'male'}
            onPress={() => setSelected('male')}
          />
          <AvatarCard
            key="card-female"
            image={FEMALE_AVATAR}
            imageKey="female"
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
    paddingTop: 8,
    paddingBottom: 28,
    gap: 16,
  },
  intro: {
    gap: 8,
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
    alignItems: 'stretch',
    gap: 12,
    minHeight: 420,
  },
  button: {
    marginTop: 8,
  },
});
