import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParqQuestion } from '../../../components/ParqQuestion';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { useAppStore } from '../../../store/useAppStore';
import { colors } from '../../../theme/colors';
import { font } from '../../../theme/fonts';

const PART1_KEYS = ['q1', 'q2', 'q3', 'q4'] as const;

export default function ParqPart1Screen() {
  const { t } = useTranslation();
  const router = useRouter();
  const parqAnswers = useAppStore((state) => state.parqAnswers);
  const setParqAnswer = useAppStore((state) => state.setParqAnswer);

  const allAnswered = PART1_KEYS.every((_, index) => parqAnswers[index] !== null);

  const handleNext = () => {
    if (!allAnswered) return;
    router.push('/onboarding/parq/part2');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={t('parq.header')} showBack />

      <Text style={styles.intro}>{t('parq.intro')}</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PART1_KEYS.map((key, index) => (
          <ParqQuestion
            key={key}
            text={t(`parq.${key}`)}
            value={parqAnswers[index]}
            onChange={(value) => setParqAnswer(index, value)}
            yesLabel={t('parq.yes')}
            noLabel={t('parq.no')}
            tall={index === 0}
          />
        ))}

        <View style={styles.buttonWrap}>
          <PrimaryButton
            label={t('parq.next')}
            onPress={handleNext}
            disabled={!allAnswered}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  intro: {
    marginTop: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    ...font('medium'),
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scroll: {
    flex: 1,
    marginTop: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 36,
  },
  buttonWrap: {
    marginTop: 4,
  },
});
