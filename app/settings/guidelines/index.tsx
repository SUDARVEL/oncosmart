import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '../../../components/PressableScale';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { useAndroidBack } from '../../../hooks/useAndroidBack';
import {
  CANCER_TYPE_I18N_KEYS,
  CANCER_TYPE_SLUGS,
  normalizeCancerTypeSlug,
} from '../../../lib/cancerPathway';
import { goBackOr } from '../../../lib/navBack';
import { useAppStore } from '../../../store/useAppStore';
import { colors } from '../../../theme/colors';
import { uiText } from '../../../theme/typography';

type GuidelineCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void;
};

function GuidelineCard({ icon, title, description, onPress }: GuidelineCardProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      pressedScale={0.985}
      style={styles.card}
    >
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={28} color={colors.buttonPrimary} />
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textPlaceholder} />
    </PressableScale>
  );
}

export default function GuidelinesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const cancerType = useAppStore((state) => state.cancerType);
  const selected = normalizeCancerTypeSlug(cancerType);
  const cancers = selected ? [selected] : CANCER_TYPE_SLUGS;

  const handleBack = useCallback(() => {
    goBackOr(() => router.replace('/settings'));
  }, [router]);

  useAndroidBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack]),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('guidelines.title')} showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GuidelineCard
          icon="clipboard-outline"
          title={t('guidelines.generalTitle')}
          description={t('guidelines.generalDescription')}
          onPress={() => router.push('/settings/guidelines/general')}
        />
        {cancers.map((slug) => (
          <GuidelineCard
            key={slug}
            icon="ribbon-outline"
            title={t('guidelines.dosDontsTitle', { cancer: t(CANCER_TYPE_I18N_KEYS[slug]) })}
            description={t('guidelines.dosDontsDescription')}
            onPress={() =>
              router.push({ pathname: '/settings/guidelines/dos-donts', params: { cancer: slug } })
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.homeCardBg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tabIconActiveBg,
  },
  cardText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  cardTitle: {
    ...uiText(16, 'semiBold'),
    color: '#1E1E1E',
  },
  cardDescription: {
    ...uiText(12, 'regular'),
    color: colors.textMuted,
  },
});
