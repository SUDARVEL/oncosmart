import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '../../../components/PressableScale';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { useAndroidBack } from '../../../hooks/useAndroidBack';
import {
  CANCER_TYPE_I18N_KEYS,
  normalizeCancerTypeSlug,
  resolveMediaGender,
} from '../../../lib/cancerPathway';
import { DOS_AND_DONTS, getDoDontImage, type DoDontKey } from '../../../lib/exerciseGuidelines';
import { goBackOr } from '../../../lib/navBack';
import { useAppStore } from '../../../store/useAppStore';
import { colors } from '../../../theme/colors';
import { uiText } from '../../../theme/typography';

type Tab = 'dos' | 'donts';

/** The app's own success green and error red, used only for the tick and cross marks. */
const MARK_COLORS: Record<Tab, string> = {
  dos: '#16A34A',
  donts: '#DC2626',
};

function pairs(keys: DoDontKey[]): DoDontKey[][] {
  const rows: DoDontKey[][] = [];
  for (let index = 0; index < keys.length; index += 2) {
    rows.push(keys.slice(index, index + 2));
  }
  return rows;
}

export default function DosAndDontsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ cancer?: string }>();
  const storedCancer = useAppStore((state) => state.cancerType);
  const gender = useAppStore((state) => state.gender);
  const avatar = useAppStore((state) => state.avatar);
  const [tab, setTab] = useState<Tab>('dos');

  const slug =
    normalizeCancerTypeSlug(params.cancer) ?? normalizeCancerTypeSlug(storedCancer) ?? 'breast';
  const mediaGender = resolveMediaGender(gender, avatar);
  const rows = pairs(DOS_AND_DONTS[slug][tab]);

  const handleBack = useCallback(() => {
    goBackOr(() => router.replace('/settings/guidelines'));
  }, [router]);

  useAndroidBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack]),
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t(CANCER_TYPE_I18N_KEYS[slug])} showBack onBack={handleBack} />

      <View style={styles.tabs}>
        {(['dos', 'donts'] as const).map((entry) => {
          const active = entry === tab;
          return (
            <PressableScale
              key={entry}
              onPress={() => setTab(entry)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              pressedScale={0.98}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Ionicons
                name={entry === 'dos' ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={active ? colors.buttonText : MARK_COLORS[entry]}
              />
              <Text
                style={[styles.tabLabel, active && styles.tabLabelActive]}
                numberOfLines={2}
              >
                {t(`guidelines.${entry}`)}
              </Text>
            </PressableScale>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {rows.map((row) => (
          <View key={row.join('|')} style={styles.gridRow}>
            {row.map((key) => (
              <View key={key} style={styles.card}>
                <View style={styles.imageWrap}>
                  <Image
                    source={getDoDontImage(key, mediaGender)}
                    style={styles.image}
                    contentFit="cover"
                    accessible={false}
                  />
                  <View style={[styles.badge, { backgroundColor: MARK_COLORS[tab] }]}>
                    <Ionicons
                      name={tab === 'dos' ? 'checkmark' : 'close'}
                      size={18}
                      color={colors.buttonText}
                    />
                  </View>
                </View>
                <Text style={styles.cardText}>{t(`guidelines.items.${key}`)}</Text>
              </View>
            ))}
            {row.length === 1 ? <View style={styles.cardSpacer} /> : null}
          </View>
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
  tabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.optionBg,
  },
  tab: {
    flex: 1,
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  tabActive: {
    backgroundColor: colors.buttonPrimary,
  },
  tabLabel: {
    ...uiText(14, 'semiBold'),
    color: colors.progressText,
    flexShrink: 1,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: colors.buttonText,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 12,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 0,
    padding: 8,
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.homeCardBg,
  },
  cardSpacer: {
    flex: 1,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.optionBg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    ...uiText(13, 'medium'),
    color: '#1E1E1E',
    textAlign: 'center',
    paddingHorizontal: 2,
    paddingBottom: 4,
  },
});
