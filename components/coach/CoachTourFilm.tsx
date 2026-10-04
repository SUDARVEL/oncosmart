import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  COACH_FILM_CHAPTERS,
  coachFilmChapterIndex,
  getCoachMarkVideoUrl,
} from '../../lib/coachMarkVideo';
import { useAppStore } from '../../store/useAppStore';
import { font } from '../../theme/fonts';

const TITLE = '#3C2F86';
const BAR = '#5B4B9A';
const BAR_OFF = '#E6E1F4';
const BUTTON = '#3A3A3C';

/**
 * Full-screen guided tour in the onboarding format:
 * progress, Skip, a large title, the storage video, and Next.
 */
export function CoachTourFilm() {
  const coachTourSeen = useAppStore((state) => state.coachTourSeen === true);
  const coachTourStep = useAppStore((state) => state.coachTourStep);
  const setCoachTourSeen = useAppStore((state) => state.setCoachTourSeen);
  const setCoachTourStep = useAppStore((state) => state.setCoachTourStep);
  const visible = !coachTourSeen && coachTourStep != null;

  const close = () => {
    setCoachTourSeen(true);
    setCoachTourStep(null);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
      presentationStyle="fullScreen"
    >
      {visible ? <CoachTourFilmBody onClose={close} /> : <View style={styles.screen} />}
    </Modal>
  );
}

function CoachTourFilmBody({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const url = getCoachMarkVideoUrl();
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const seekingRef = useRef(false);
  const last = COACH_FILM_CHAPTERS.length - 1;
  const chapter = COACH_FILM_CHAPTERS[index] ?? COACH_FILM_CHAPTERS[0];

  const player = useVideoPlayer(url, (instance) => {
    instance.loop = false;
    instance.muted = true;
    instance.timeUpdateEventInterval = 0.25;
    instance.play();
  });

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const timeSub = player.addListener('timeUpdate', ({ currentTime }) => {
      if (seekingRef.current) {
        const target = COACH_FILM_CHAPTERS[indexRef.current]?.start ?? 0;
        if (Math.abs(currentTime - target) < 0.75) seekingRef.current = false;
        return;
      }
      const next = coachFilmChapterIndex(currentTime);
      setIndex((current) => (current === next ? current : next));
    });
    return () => {
      timeSub.remove();
    };
  }, [player]);

  const goTo = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(last, nextIndex));
    seekingRef.current = true;
    indexRef.current = clamped;
    setIndex(clamped);
    const start = COACH_FILM_CHAPTERS[clamped]?.start ?? 0;
    player.currentTime = start;
    player.play();
  };

  const onNext = () => {
    if (index >= last) {
      onClose();
      return;
    }
    goTo(index + 1);
  };

  const onBack = () => {
    if (index <= 0) {
      onClose();
      return;
    }
    goTo(index - 1);
  };

  return (
    <View style={[styles.screen, { paddingBottom: Math.max(insets.bottom, 16) }]}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <View style={styles.topRow}>
          <Pressable
            onPress={onBack}
            hitSlop={10}
            accessibilityRole="button"
            style={styles.back}
          >
            <Ionicons name="chevron-back" size={26} color="#111111" />
          </Pressable>
          <View style={styles.bars}>
            {COACH_FILM_CHAPTERS.map((item, bar) => (
              <View
                key={item.start}
                style={[
                  styles.bar,
                  bar === index && styles.barCurrent,
                  { backgroundColor: bar <= index ? BAR : BAR_OFF },
                ]}
              />
            ))}
          </View>
          <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button">
            <Text style={styles.skip}>{t('coach.skip')}</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>{t(chapter.titleKey)}</Text>
      </View>

      <View style={styles.stage}>
        {url ? (
          <VideoView
            style={styles.video}
            player={player}
            contentFit="contain"
            nativeControls={false}
            allowsPictureInPicture={false}
            surfaceType="textureView"
          />
        ) : null}
      </View>

      <Pressable
        onPress={onNext}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={index >= last ? t('coach.filmReady') : t('coach.next')}
      >
        <Text style={styles.buttonText}>
          {index >= last ? t('coach.filmReady') : t('coach.next')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    zIndex: 2,
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 36,
  },
  back: {
    width: 28,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  bars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  barCurrent: {
    flex: 1.7,
  },
  skip: {
    fontSize: 16,
    lineHeight: 22,
    color: '#4B5563',
    ...font('medium'),
  },
  title: {
    marginTop: 22,
    paddingHorizontal: 12,
    fontSize: 28,
    lineHeight: 36,
    textAlign: 'center',
    color: TITLE,
    ...font('bold'),
  },
  stage: {
    flex: 1,
    marginTop: 20,
    marginBottom: 18,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#F7F7F8',
  },
  video: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  button: {
    height: 56,
    borderRadius: 28,
    backgroundColor: BUTTON,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 17,
    lineHeight: 22,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
});
