import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParqQuestion } from '../../../components/ParqQuestion';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { useAppStore } from '../../../store/useAppStore';
import { colors } from '../../../theme/colors';

const PART2_KEYS = ['q5', 'q6', 'q7'] as const;
const PART2_OFFSET = 4;

export default function ParqPart2Screen() {
  const { t } = useTranslation();
  const router = useRouter();
  const parqAnswers = useAppStore((state) => state.parqAnswers);
  const setParqAnswer = useAppStore((state) => state.setParqAnswer);
  const setParqCleared = useAppStore((state) => state.setParqCleared);

  const allAnswered = PART2_KEYS.every((_, index) => parqAnswers[PART2_OFFSET + index] !== null);

  const handleContinue = () => {
    if (!allAnswered) return;
    const hasYes = parqAnswers.some((answer) => answer === true);
    setParqCleared(!hasYes);
    router.push('/onboarding/parq/result');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScreenHeader title={t('parq.header')} showBack />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PART2_KEYS.map((key, index) => (
          <ParqQuestion
            key={key}
            text={t(`parq.${key}`)}
            value={parqAnswers[PART2_OFFSET + index]}
            onChange={(value) => setParqAnswer(PART2_OFFSET + index, value)}
            yesLabel={t('parq.yes')}
            noLabel={t('parq.no')}
            tall={index < 2}
          />
        ))}

        <View style={styles.buttonWrap}>
          <PrimaryButton
            label={t('parq.continue')}
            onPress={handleContinue}
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
  scroll: {
    flex: 1,
    marginTop: 86,
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
