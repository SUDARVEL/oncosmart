import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LanguageCard } from '../components/LanguageCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAndroidBack } from '../hooks/useAndroidBack';
import { exitApp } from '../lib/navBack';
import { setPreferredLanguage } from '../lib/preferredLanguage';
import { AppLanguage, useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

/** Pre-login language gate: Language → Login. */
export default function PreLoginLanguageScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const savedLanguage = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [selected, setSelected] = useState<AppLanguage | null>(savedLanguage);

  useEffect(() => {
    if (!selected || i18n.language === selected) return;
    void i18n.changeLanguage(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  // Never allow back into a cleared "Welcome, Guest" Home after logout.
  useAndroidBack(
    useCallback(() => {
      exitApp();
      return true;
    }, []),
  );

  const handleContinue = () => {
    if (!selected) return;
    setLanguage(selected);
    void setPreferredLanguage(selected);
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={t('language.header')} largeTitle />

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
    paddingHorizontal: 32,
    gap: 20,
    marginTop: -24,
  },
  intro: {
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    ...font('semiBold'),
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    ...font('regular'),
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 16,
  },
});
