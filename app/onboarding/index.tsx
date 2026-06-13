import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageCard } from '../../components/LanguageCard';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { AppLanguage, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

export default function LanguageScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const savedLanguage = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [selected, setSelected] = useState<AppLanguage | null>(savedLanguage);

  useEffect(() => {
    if (selected) {
      void i18n.changeLanguage(selected);
    }
  }, [selected, i18n]);

  const handleContinue = () => {
    if (!selected) return;
    setLanguage(selected);
    router.push('/onboarding/username');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={t('language.header')} />

      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>{t('language.title')}</Text>
          <Text style={styles.subtitle}>{t('language.subtitle')}</Text>
        </View>

        <View style={styles.cardsRow}>
          <LanguageCard
            label={t('language.english')}
            glyph="Aa"
            selected={selected === 'en'}
            onPress={() => setSelected('en')}
          />
          <LanguageCard
            label={t('language.tamil')}
            glyph="த"
            selected={selected === 'ta'}
            onPress={() => setSelected('ta')}
          />
        </View>

        <PrimaryButton
          label={t('language.continue')}
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
    justifyContent: 'center',
    paddingHorizontal: 61,
    gap: 16,
    marginTop: -40,
  },
  intro: {
    gap: 4,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    ...font('medium'),
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 17,
    marginBottom: 8,
  },
});
