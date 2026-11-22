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

const TAB_COLORS: Record<Tab, { solid: string; border: string; tint: string }> = {
  dos: { solid: '#16A34A', border: '#B7E4C7', tint: '#F0FAF4' },
  donts: { solid: '#DC2626', border: '#F5C2C2', tint: '#FEF3F3' },
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
  const palette = TAB_COLORS[tab];
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
              style={[styles.tab, active && { backgroundColor: TAB_COLORS[entry].solid }]}
            >
              <Ionicons
                name={entry === 'dos' ? 'checkmark-circle' : 'close-circle'}
                size={18}
                color={active ? '#FFFFFF' : TAB_COLORS[entry].solid}
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
              <View
                key={key}
                style={[
                  styles.card,
                  { borderColor: palette.border, backgroundColor: palette.tint },
                ]}
              >
                <View style={styles.imageWrap}>
                  <Image
                    source={getDoDontImage(key, mediaGender)}
                    style={styles.image}
                    contentFit="cover"
                    accessible={false}
                  />
                  <View style={[styles.badge, { backgroundColor: palette.solid }]}>
                    <Ionicons
                      name={tab === 'dos' ? 'checkmark' : 'close'}
                      size={18}
                      color="#FFFFFF"
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
    backgroundColor: colors.background,
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
  tabLabel: {
    ...uiText(14, 'semiBold'),
    color: '#1E1E1E',
    flexShrink: 1,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#FFFFFF',
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
