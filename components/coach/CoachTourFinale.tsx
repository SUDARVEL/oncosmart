import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COACH_TOUR_FINALE_MS, COACH_TOUR_FINALE_STEP } from '../../lib/coachTour';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

/** Closing card. It holds, then continues into the app on its own. */
export function CoachTourFinale() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const coachTourSeen = useAppStore((state) => state.coachTourSeen === true);
  const coachTourStep = useAppStore((state) => state.coachTourStep);
  const setCoachTourSeen = useAppStore((state) => state.setCoachTourSeen);
  const setCoachTourStep = useAppStore((state) => state.setCoachTourStep);
  const enter = useRef(new Animated.Value(0)).current;
  const progress = useRef(new Animated.Value(0)).current;
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
      return;
    }
    finishedRef.current = false;
    enter.setValue(0);
    progress.setValue(0);
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    const progressAnim = Animated.timing(progress, {
      toValue: 1,
      duration: COACH_TOUR_FINALE_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    progressAnim.start(({ finished }) => {
      if (finished) finish();
    });
    return () => {
      progressAnim.stop();
    };
    // finish reads the latest store actions; the effect should run once per appearance.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal visible animationType="fade" onRequestClose={finish} statusBarTranslucent>
      <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Animated.View
          style={[
            styles.copy,
            {
              opacity: enter,
              transform: [
                {
                  translateY: enter.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>{t('coach.videoAllSetTitle')}</Text>
          <Text style={styles.body}>{t('coach.videoAllSetBody')}</Text>
          <View style={styles.note}>
            <Ionicons name="information-circle-outline" size={16} color={colors.navy} />
            <Text style={styles.noteText}>{t('coach.videoReplayNote')}</Text>
          </View>
        </Animated.View>
        <View style={[styles.progressTrack, { bottom: Math.max(insets.bottom, 16) + 28 }]}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
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
