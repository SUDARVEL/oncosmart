import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PressableScale } from '../PressableScale';
import { colors } from '../../theme/colors';
import { displayFontStyle, font } from '../../theme/fonts';
import { uiText } from '../../theme/typography';

/** Optional extra rest a patient can add once during the mandatory rest. */
export const EXTRA_REST_SECONDS = 20;

type Props = {
  seconds: number;
  onComplete: () => void;
  onBackPress: () => void;
};

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function RestTimerScreen({ seconds, onComplete, onBackPress }: Props) {
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState(seconds);
  const [extraCount, setExtraCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemaining(seconds);
    setExtraCount(0);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onCompleteRef.current();
      return;
    }

    const timer = setTimeout(() => {
      setRemaining((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining]);

  const handleAddExtra = () => {
    setRemaining((value) => value + EXTRA_REST_SECONDS);
    setExtraCount((value) => value + 1);
  };

  const handleUndoExtra = () => {
    if (extraCount <= 0) return;
    setRemaining((value) => Math.max(0, value - EXTRA_REST_SECONDS));
    setExtraCount((value) => value - 1);
  };

  const handleSkip = () => {
    onCompleteRef.current();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <PressableScale
          onPress={onBackPress}
          style={styles.backButton}
          accessibilityRole="button"
          pressedScale={0.9}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </PressableScale>
      </View>

      <View style={styles.content}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('sessionFlow.restTitle')}</Text>
          <Text style={styles.subtitle}>{t('sessionFlow.restSubtitle')}</Text>
        </View>

        <Text style={styles.timer} accessibilityRole="timer">
          {formatClock(remaining)}
        </Text>

        <View style={styles.actions}>
          <PressableScale
            onPress={handleAddExtra}
            style={[styles.actionButton, styles.actionSecondary]}
            accessibilityRole="button"
            accessibilityLabel={t('sessionFlow.restAddExtra')}
          >
            <Text style={styles.actionSecondaryText} numberOfLines={1}>
              {t('sessionFlow.restAddExtra')}
            </Text>
          </PressableScale>

          {extraCount > 0 ? (
            <PressableScale
              onPress={handleUndoExtra}
              style={[styles.actionButton, styles.actionSecondary]}
              accessibilityRole="button"
              accessibilityLabel={t('sessionFlow.restUndoExtra')}
            >
              <Text style={styles.actionSecondaryText} numberOfLines={1}>
                {t('sessionFlow.restUndoExtra')}
              </Text>
            </PressableScale>
          ) : null}

          <PressableScale
            onPress={handleSkip}
            style={[styles.actionButton, styles.actionPrimary]}
            accessibilityRole="button"
            accessibilityLabel={t('sessionFlow.restSkip')}
          >
            <Text style={styles.actionPrimaryText} numberOfLines={1}>
              {t('sessionFlow.restSkip')}
            </Text>
          </PressableScale>
        </View>
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
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 13,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
    gap: 16,
  },
  textBlock: {
    width: '100%',
    maxWidth: 356,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 24,
    lineHeight: 31,
    color: '#262526',
    textAlign: 'center',
    ...font('semiBold'),
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#535862',
    textAlign: 'center',
    ...font('regular'),
  },
  timer: {
    fontSize: 64,
    lineHeight: 82,
    color: '#00131F',
    textAlign: 'center',
    ...displayFontStyle(),
  },
  actions: {
    width: '100%',
    maxWidth: 356,
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  actionSecondary: {
    backgroundColor: colors.tabIconActiveBg,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
  },
  actionPrimary: {
    backgroundColor: colors.buttonPrimary,
  },
  actionSecondaryText: {
    ...uiText(15, 'semiBold'),
    color: colors.buttonPrimary,
  },
  actionPrimaryText: {
    ...uiText(15, 'semiBold'),
    color: colors.buttonText,
  },
});
