import { useLocalSearchParams, useRouter } from 'expo-router';
import { memo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarCard } from '../../components/AvatarCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { AppAvatar, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

const MALE_AVATAR = require('../../assets/avatars/male-avatar.png');
const FEMALE_AVATAR = require('../../assets/avatars/female-avatar.png');

/** Hard-wired male card — source can never become female. */
const MaleAvatarOption = memo(function MaleAvatarOption({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <AvatarCard
      image={MALE_AVATAR}
      label={label}
      selected={selected}
      onPress={onPress}
    />
  );
});

/** Hard-wired female card — source can never become male. */
const FemaleAvatarOption = memo(function FemaleAvatarOption({
  selected,
  label,
  onPress,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <AvatarCard
      image={FEMALE_AVATAR}
      label={label}
      selected={selected}
      onPress={onPress}
    />
  );
});

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

        <View style={styles.cardsRow} collapsable={false}>
          <MaleAvatarOption
            selected={selected === 'male'}
            label={t('gender.male')}
            onPress={() => setSelected('male')}
          />
          <FemaleAvatarOption
            selected={selected === 'female'}
            label={t('gender.female')}
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  button: {
    marginTop: 8,
  },
});
