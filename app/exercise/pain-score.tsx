import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HighPainRestModal } from '../../components/pain/HighPainRestModal';
import { PainScorePanel } from '../../components/pain/PainScorePanel';
import { ReadyToBeginModal } from '../../components/pain/ReadyToBeginModal';
import { HIGH_PAIN_REST_THRESHOLD, HIGH_PAIN_THRESHOLD } from '../../lib/painScore';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

export default function PainScoreScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { day, level: levelParam } = useLocalSearchParams<{ day?: string; level?: string }>();
  const dayInLevel = Number(day) || 1;
  const level = Number(levelParam) || 1;
  const setPainScore = useAppStore((state) => state.setPainScore);
  const [score, setScore] = useState(0);
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [showRestModal, setShowRestModal] = useState(false);
  // Avoid re-popping while the patient stays in the high range after dismissing.
  const [restPromptDismissed, setRestPromptDismissed] = useState(false);

  const handleScoreChange = (next: number) => {
    setScore(next);
    if (Math.round(next) >= HIGH_PAIN_REST_THRESHOLD) {
      if (!restPromptDismissed) setShowRestModal(true);
    } else {
      setShowRestModal(false);
      setRestPromptDismissed(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const goToDaySession = () => {
    setPainScore(level, dayInLevel, Math.round(score));
    router.replace(`/exercise/sessions/${dayInLevel}?level=${level}`);
  };

  const handleContinue = () => {
    if (Math.round(score) > HIGH_PAIN_THRESHOLD) {
      setShowReadyModal(true);
      return;
    }
    goToDaySession();
  };

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.sheet} edges={['bottom']}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('pain.title')}</Text>
          <Pressable
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel={t('pain.close')}
          >
            <Ionicons name="close" size={24} color="#6B7280" />
          </Pressable>
        </View>
        <View style={styles.divider} />
        <PainScorePanel
          score={score}
          onScoreChange={handleScoreChange}
          onContinue={handleContinue}
        />
      </SafeAreaView>

      <HighPainRestModal
        visible={showRestModal}
        onRest={() => {
          setShowRestModal(false);
          handleClose();
        }}
        onContinue={() => {
          setShowRestModal(false);
          setRestPromptDismissed(true);
        }}
      />

      <ReadyToBeginModal
        visible={showReadyModal}
        onNo={() => setShowReadyModal(false)}
        onYes={() => {
          setShowReadyModal(false);
          goToDaySession();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.2)',
    justifyContent: 'flex-end',
  },
  sheet: {
    flex: 1,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 16,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    marginTop: 8,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    ...font('medium'),
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
});
