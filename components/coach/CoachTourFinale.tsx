import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COACH_TOUR_FINALE_MS, COACH_TOUR_FINALE_STEP } from '../../lib/coachTour';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

/** Closing card. The words stay on screen, then the app continues on its own. */
export function CoachTourFinale() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const coachTourSeen = useAppStore((state) => state.coachTourSeen === true);
  const coachTourStep = useAppStore((state) => state.coachTourStep);
  const setCoachTourSeen = useAppStore((state) => state.setCoachTourSeen);
  const setCoachTourStep = useAppStore((state) => state.setCoachTourStep);
  const [trackWidth, setTrackWidth] = useState(0);
  const [progress, setProgress] = useState(0);
  const finishedRef = useRef(false);

  const visible = !coachTourSeen && coachTourStep === COACH_TOUR_FINALE_STEP;

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setCoachTourSeen(true);
    setCoachTourStep(null);
    router.replace('/home');
  };

  useEffect(() => {
    if (!visible) {
      finishedRef.current = false;
      setProgress(0);
      return;
    }
    finishedRef.current = false;
    setProgress(0);
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const next = Math.min(1, (Date.now() - startedAt) / COACH_TOUR_FINALE_MS);
      setProgress(next);
      if (next >= 1) {
        clearInterval(timer);
        finish();
      }
    }, 50);
    return () => clearInterval(timer);
    // finish is stable for this appearance: store setters and router do not change the beat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal visible animationType="fade" onRequestClose={finish} statusBarTranslucent>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <View style={styles.copy}>
          <Text style={styles.title}>{t('coach.videoAllSetTitle')}</Text>
          <Text style={styles.body}>{t('coach.videoAllSetBody')}</Text>
          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={16} color={colors.navy} />
            <Text style={styles.noteText}>{t('coach.videoReplayNote')}</Text>
          </View>
        </View>
        <View
          style={[styles.progressTrack, { bottom: Math.max(insets.bottom, 16) + 28 }]}
          onLayout={(event) => {
            const nextWidth = event.nativeEvent.layout.width;
            if (!Number.isFinite(nextWidth) || nextWidth < 1) return;
            if (Math.abs(nextWidth - trackWidth) > 1) setTrackWidth(nextWidth);
          }}
        >
          <View style={[styles.progressFill, { width: Math.max(0, trackWidth * progress) }]} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  copy: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.navy,
    textAlign: 'center',
    ...font('bold'),
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'center',
    ...font('regular'),
  },
  note: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D6E4F0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.navy,
    ...font('medium'),
  },
  progressTrack: {
    position: 'absolute',
    left: 48,
    right: 48,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.buttonPrimary,
  },
});
