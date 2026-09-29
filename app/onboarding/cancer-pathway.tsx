import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { SelectOption } from '../../components/SelectOption';
import {
  CANCER_TYPE_I18N_KEYS,
  CANCER_TYPE_SLUGS,
  normalizeCancerTypeSlug,
  type CancerTypeSlug,
} from '../../lib/cancerPathway';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

/**
 * Dedicated cancer pathway picker — Breast / Thorax / Abdomen / Head & Neck.
 * Combined with gender + language to load the matching exercise video sessions.
 */
export default function CancerPathwayScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const savedCancerType = useAppStore((state) => state.cancerType);
  const setCancerType = useAppStore((state) => state.setCancerType);

  const initialSlug = useMemo(
    () => normalizeCancerTypeSlug(savedCancerType),
    [savedCancerType],
  );
  const [selected, setSelected] = useState<CancerTypeSlug | null>(initialSlug);

  const handleContinue = () => {
    if (!selected) return;
    setCancerType(selected);
    router.push('/onboarding/treatment');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('cancerPathway.header')} showBack largeTitle />

      <View style={styles.content}>
        <View style={styles.intro}>
          <Text style={styles.title}>{t('cancerPathway.title')}</Text>
          <Text style={styles.subtitle}>{t('cancerPathway.subtitle')}</Text>
        </View>

        <View style={styles.options}>
          {CANCER_TYPE_SLUGS.map((slug) => (
            <SelectOption
              key={slug}
              label={t(CANCER_TYPE_I18N_KEYS[slug])}
              selected={selected === slug}
              onPress={() => setSelected(slug)}
            />
          ))}
        </View>

        <PrimaryButton
          label={t('cancerPathway.continue')}
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
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
    ...font('semiBold'),
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
    ...font('regular'),
  },
  options: {
    gap: 12,
  },
});
