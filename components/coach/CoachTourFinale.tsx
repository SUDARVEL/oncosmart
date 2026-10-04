import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COACH_TOUR_FINALE_STEP } from '../../lib/coachTour';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

/** Closing card after the in-app tour. Does not play the reference recording. */
export function CoachTourFinale() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const coachTourSeen = useAppStore((state) => state.coachTourSeen === true);
  const coachTourStep = useAppStore((state) => state.coachTourStep);
  const setCoachTourSeen = useAppStore((state) => state.setCoachTourSeen);
  const setCoachTourStep = useAppStore((state) => state.setCoachTourStep);

  const visible = !coachTourSeen && coachTourStep === COACH_TOUR_FINALE_STEP;
  if (!visible) return null;

  const finish = () => {
    setCoachTourSeen(true);
    setCoachTourStep(null);
    router.replace('/home');
  };

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
        <Pressable
          onPress={finish}
          style={styles.button}
          accessibilityRole="button"
          accessibilityLabel={t('coach.videoContinue')}
        >
          <Text style={styles.buttonText}>{t('coach.videoContinue')}</Text>
        </Pressable>
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
  button: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 28,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
});
