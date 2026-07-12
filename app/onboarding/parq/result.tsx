import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParqCheckmarkIllustration } from '../../../components/ParqCheckmarkIllustration';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { colors } from '../../../theme/colors';
import { font } from '../../../theme/fonts';

export default function ParqResultScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  const parqCleared = useAppStore((state) => state.parqCleared);
  const cleared = preview === 'consult' ? false : preview === 'cleared' ? true : parqCleared === true;

  const handleStart = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backSlot} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.hero}>
          <ParqCheckmarkIllustration size="large" />

          <View style={styles.textBlock}>
            <Text style={styles.title}>
              {cleared ? t('parq.congratsTitle') : t('parq.consultTitle')}
            </Text>
            <Text style={styles.subtitle}>
              {cleared ? t('parq.congratsSubtitle') : t('parq.consultSubtitle')}
            </Text>
          </View>
        </View>

        <PrimaryButton
          label={t('parq.startPlan')}
          onPress={handleStart}
          variant={cleared ? 'primary' : 'muted'}
          style={styles.cta}
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
  header: {
    minHeight: 48,
    marginTop: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  backSlot: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 28,
    paddingTop: 40,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 8,
    maxWidth: 360,
    alignSelf: 'center',
    width: '100%',
    gap: 24,
  },
  textBlock: {
    gap: 12,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    ...font('semiBold'),
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 26,
    ...font('regular'),
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 340,
  },
  cta: {
    height: 56,
  },
});
