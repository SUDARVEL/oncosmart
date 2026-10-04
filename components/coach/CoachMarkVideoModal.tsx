import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getCoachMarkLogoUrl, getCoachMarkVideoUrl } from '../../lib/coachMarkVideo';
import { useAppStore, type AppLanguage } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  onClose: () => void;
};

function formatTime(seconds: number): string {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const total = Math.floor(safe);
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${remain.toString().padStart(2, '0')}`;
}

/**
 * Full-screen walkthrough player that replaces the spotlight coach marks.
 * A scrub slider sits under the video. Skip and the end card follow the app language.
 */
export function CoachMarkVideoModal({ onClose }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const language = useAppStore((state) => state.language);
  const mediaLanguage: AppLanguage = language === 'ta' ? 'ta' : 'en';
  const videoUrl = getCoachMarkVideoUrl(mediaLanguage);
  const logoUrl = getCoachMarkLogoUrl();
  const scrubbing = useRef(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [ready, setReady] = useState(false);

  const player = useVideoPlayer(videoUrl, (instance) => {
    instance.loop = false;
    instance.muted = false;
    instance.timeUpdateEventInterval = 0.25;
    instance.audioMixingMode = 'mixWithOthers';
    instance.play();
  });

  useEffect(() => {
    const timeSub = player.addListener('timeUpdate', ({ currentTime }) => {
      if (!scrubbing.current) setProgress(currentTime);
      if (player.duration > 0) setDuration(player.duration);
    });
    const endSub = player.addListener('playToEnd', () => {
      setEnded(true);
      setPaused(true);
    });
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        setReady(true);
        if (player.duration > 0) setDuration(player.duration);
      }
    });
    return () => {
      timeSub.remove();
      endSub.remove();
      statusSub.remove();
    };
  }, [player]);

  const togglePlay = () => {
    if (ended) {
      player.currentTime = 0;
      setProgress(0);
      setEnded(false);
      setPaused(false);
      player.play();
      return;
    }
    if (player.playing) {
      player.pause();
      setPaused(true);
      return;
    }
    player.play();
    setPaused(false);
  };

  return (
    <Modal visible animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.screen}>
        <VideoView
          style={styles.video}
          player={player}
          contentFit="contain"
          nativeControls={false}
          allowsFullscreen={false}
          {...(Platform.OS === 'android' ? { surfaceType: 'textureView' as const } : {})}
        />

        {!ready && logoUrl ? (
          <View style={styles.poster} pointerEvents="none">
            <Image source={{ uri: logoUrl }} style={styles.logo} contentFit="contain" />
          </View>
        ) : null}

        <Pressable style={styles.tapLayer} onPress={togglePlay} accessibilityRole="button" />

        {paused && !ended ? (
          <View style={styles.playBadge} pointerEvents="none">
            <Ionicons name="play" size={28} color="#FFFFFF" />
          </View>
        ) : null}

        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 12) }]}>
          <Pressable
            onPress={onClose}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel={t('coach.skip')}
          >
            <Text style={styles.skipText}>{t('coach.skip')}</Text>
          </Pressable>
        </View>

        {ended ? (
          <View style={styles.endCard}>
            <Text style={styles.endTitle}>{t('coach.videoAllSetTitle')}</Text>
            <Text style={styles.endBody}>{t('coach.videoAllSetBody')}</Text>
            <View style={styles.endNote}>
              <Ionicons name="information-circle-outline" size={16} color={colors.navy} />
              <Text style={styles.endNoteText}>{t('coach.videoReplayNote')}</Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.continueButton, { bottom: Math.max(insets.bottom, 16) }]}
              accessibilityRole="button"
              accessibilityLabel={t('coach.videoContinue')}
            >
              <Text style={styles.continueText}>{t('coach.videoContinue')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.controls, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration > 0 ? duration : 1}
              value={Math.min(progress, duration > 0 ? duration : progress)}
              minimumTrackTintColor={colors.buttonPrimary}
              maximumTrackTintColor="rgba(255,255,255,0.35)"
              thumbTintColor="#FFFFFF"
              onSlidingStart={() => {
                scrubbing.current = true;
              }}
              onValueChange={(value) => setProgress(value)}
              onSlidingComplete={(value) => {
                player.currentTime = value;
                setProgress(value);
                scrubbing.current = false;
                if (ended) setEnded(false);
              }}
            />
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(progress)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  video: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 220,
    height: 220,
  },
  tapLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  playBadge: {
    position: 'absolute',
    alignSelf: 'center',
    top: '46%',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  skipButton: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(11, 18, 32, 0.82)',
  },
  slider: {
    width: '100%',
    height: 32,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  timeText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#E5E7EB',
    ...font('medium'),
  },
  endCard: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  endTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.navy,
    textAlign: 'center',
    ...font('bold'),
  },
  endBody: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'center',
    ...font('regular'),
  },
  endNote: {
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
  endNoteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colors.navy,
    ...font('medium'),
  },
  continueButton: {
    position: 'absolute',
    left: 24,
    right: 24,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
});
