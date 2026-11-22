import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../../../components/ScreenHeader';
import { useAndroidBack } from '../../../hooks/useAndroidBack';
import { resolveMediaGender } from '../../../lib/cancerPathway';
import { GENERAL_INSTRUCTIONS } from '../../../lib/exerciseGuidelines';
import { goBackOr } from '../../../lib/navBack';
import { useAppStore } from '../../../store/useAppStore';
import { colors } from '../../../theme/colors';
import { uiText } from '../../../theme/typography';

export default function GeneralInstructionsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const gender = useAppStore((state) => state.gender);
  const avatar = useAppStore((state) => state.avatar);
  const mediaGender = resolveMediaGender(gender, avatar);

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
      <ScreenHeader title={t('guidelines.generalTitle')} showBack onBack={handleBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {GENERAL_INSTRUCTIONS.map((item) => (
          <View key={item.key} style={styles.row}>
            <Image
              source={item.image[mediaGender]}
              style={styles.image}
              contentFit="cover"
              accessible={false}
            />
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>{t(`guidelines.general.${item.key}.title`)}</Text>
              <Text style={styles.rowBody}>{t(`guidelines.general.${item.key}.body`)}</Text>
            </View>
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
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D6E6F5',
    backgroundColor: colors.background,
  },
  image: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: colors.optionBg,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  rowTitle: {
    ...uiText(15, 'semiBold'),
    color: '#1E1E1E',
  },
  rowBody: {
    ...uiText(13, 'regular'),
    color: '#374151',
  },
});
