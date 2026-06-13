import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarCard } from '../../components/AvatarCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { AppAvatar, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

const MALE_AVATAR = require('../../assets/avatars/male-avatar.png');
const FEMALE_AVATAR = require('../../assets/avatars/female-avatar.png');

export default function AvatarScreen() {
  const { t } = useTranslation();
  const router = useRouter();
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
    router.replace('/onboarding/parq');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title="" showBack />

      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>{t('avatar.title')}</Text>
          <Text style={styles.subtitle}>{t('avatar.subtitle')}</Text>
        </View>

        <View style={styles.cardsRow}>
          <AvatarCard
            image={MALE_AVATAR}
            selected={selected === 'male'}
            onPress={() => setSelected('male')}
          />
          <AvatarCard
            image={FEMALE_AVATAR}
            selected={selected === 'female'}
            onPress={() => setSelected('female')}
          />
        </View>

        <PrimaryButton
          label={t('avatar.saveContinue')}
          onPress={handleContinue}
          disabled={!selected}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 55,
    gap: 24,
  },
  intro: {
    gap: 8,
  },
  title: {
    fontSize: 14,
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
    gap: 32,
    flex: 1,
    maxHeight: 379,
  },
});
