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
  const [played, setPlayed] = useState(0);
  const [duration, setDuration] = useState(152.37);
  const [trackWidths, setTrackWidths] = useState<number[]>([]);
  const indexRef = useRef(0);
  const seekingRef = useRef(false);
  const last = COACH_FILM_CHAPTERS.length - 1;
  const chapter = COACH_FILM_CHAPTERS[index] ?? COACH_FILM_CHAPTERS[0];

  const player = useVideoPlayer(url, (instance) => {
    instance.loop = false;
    instance.muted = true;
    instance.timeUpdateEventInterval = 0.05;
    instance.play();
  });

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    player.loop = false;
    player.muted = true;
    player.timeUpdateEventInterval = 0.05;

    const applyTime = (time: number) => {
      if (!Number.isFinite(time) || time < 0) return;
      const length = player.duration;
      if (Number.isFinite(length) && length > 1) {
        setDuration((current) => (Math.abs(current - length) > 0.2 ? length : current));
      }
      if (seekingRef.current) {
        const target = COACH_FILM_CHAPTERS[indexRef.current]?.start ?? 0;
        if (Math.abs(time - target) < 0.45) seekingRef.current = false;
        else {
          setPlayed(target);
          return;
        }
      }
      setPlayed((current) => (Math.abs(current - time) < 0.03 ? current : time));
      const next = coachFilmChapterIndex(time);
      setIndex((current) => (current === next ? current : next));
    };

    const timeSub = player.addListener('timeUpdate', ({ currentTime }) => {
      applyTime(currentTime);
    });
    const loadSub = player.addListener('sourceLoad', ({ duration: nextDuration }) => {
      if (Number.isFinite(nextDuration) && nextDuration > 1) setDuration(nextDuration);
      player.play();
    });
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') player.play();
    });
    const clock = setInterval(() => {
      try {
        applyTime(player.currentTime);
      } catch {
        // Position is not readable until the first frame.
      }
    }, 50);

    return () => {
      clearInterval(clock);
      timeSub.remove();
      loadSub.remove();
      statusSub.remove();
    };
  }, [player]);

  const goTo = (nextIndex: number) => {
    const clamped = Math.max(0, Math.min(last, nextIndex));
    seekingRef.current = true;
    indexRef.current = clamped;
    setIndex(clamped);
    const start = COACH_FILM_CHAPTERS[clamped]?.start ?? 0;
    setPlayed(start);
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
            {COACH_FILM_CHAPTERS.map((item, bar) => {
              const start = item.start;
              const end = COACH_FILM_CHAPTERS[bar + 1]?.start ?? duration;
              const span = Math.max(0.01, end - start);
              const fill = played >= end ? 1 : played <= start ? 0 : (played - start) / span;
              const width = (trackWidths[bar] ?? 0) * Math.max(0, Math.min(1, fill));
              return (
                <View
                  key={item.start}
                  style={[styles.bar, bar === index && styles.barCurrent]}
                  onLayout={(event) => {
                    const nextWidth = event.nativeEvent.layout.width;
                    if (!Number.isFinite(nextWidth) || nextWidth < 1) return;
                    setTrackWidths((current) => {
                      if (Math.abs((current[bar] ?? 0) - nextWidth) < 0.5) return current;
                      const copy = current.slice();
                      copy[bar] = nextWidth;
                      return copy;
                    });
                  }}
                >
                  <View style={[styles.barFill, { width: Math.max(width, 0) }]} />
                </View>
              );
            })}
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
    backgroundColor: BAR_OFF,
    overflow: 'hidden',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 2,
    backgroundColor: BAR,
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
