import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CoachSpotlightShape } from '../../lib/coachTour';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { uiText } from '../../theme/typography';

export type CoachTargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  visible: boolean;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  stepIndex: number;
  stepCount: number;
  target: CoachTargetRect | null;
  preferPlacement: 'below' | 'above';
  spotlight?: CoachSpotlightShape;
  pad?: number;
  onNext: () => void;
  onSkip: () => void;
};

const CARD_MAX_WIDTH = 320;
const CARD_MARGIN = 16;

/**
 * In-screen coach mark (NOT a Modal) so spotlight coords from
 * measureInWindow match the same window as the targets.
 */
export function CoachMarkOverlay({
  visible,
  title,
  body,
  icon,
  stepIndex,
  stepCount,
  target,
  preferPlacement,
  spotlight = 'rounded',
  pad = 6,
  onNext,
  onSkip,
}: Props) {
  const { t } = useTranslation();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const isLast = stepIndex >= stepCount - 1;

  let spot: CoachTargetRect | null = null;
  if (target) {
    if (spotlight === 'circle') {
      const size = Math.max(target.width, target.height) + pad * 2;
      const cx = target.x + target.width / 2;
      const cy = target.y + target.height / 2;
      spot = { x: cx - size / 2, y: cy - size / 2, width: size, height: size };
    } else {
      spot = {
        x: target.x - pad,
        y: target.y - pad,
        width: target.width + pad * 2,
        height: target.height + pad * 2,
      };
    }
  }

  let cardTop = screenH * 0.35;
  let caretLeft = screenW / 2 - 8;
  let placeBelow = preferPlacement === 'below';

  if (spot) {
    const spotBottom = spot.y + spot.height;
    const spotTop = spot.y;
    const spaceBelow = screenH - spotBottom - insets.bottom;
    const spaceAbove = spotTop - insets.top;
    const estimatedCardH = 200;

    if (preferPlacement === 'below' && spaceBelow > estimatedCardH) {
      placeBelow = true;
      cardTop = spotBottom + 12;
    } else if (preferPlacement === 'above' && spaceAbove > estimatedCardH) {
      placeBelow = false;
      cardTop = Math.max(insets.top + 8, spotTop - estimatedCardH);
    } else if (spaceBelow >= spaceAbove) {
      placeBelow = true;
      cardTop = Math.min(spotBottom + 12, screenH - insets.bottom - estimatedCardH);
    } else {
      placeBelow = false;
      cardTop = Math.max(insets.top + 8, spotTop - estimatedCardH);
    }

    caretLeft = Math.min(
      Math.max(spot.x + spot.width / 2 - 8, CARD_MARGIN + 20),
      screenW - CARD_MARGIN - 28,
    );
  }

  const cardWidth = Math.min(CARD_MAX_WIDTH, screenW - CARD_MARGIN * 2);
  const cardLeft = Math.min(
    Math.max(CARD_MARGIN, caretLeft + 8 - cardWidth / 2),
    screenW - CARD_MARGIN - cardWidth,
  );

  const radius =
    spotlight === 'circle'
      ? (spot?.width ?? 0) / 2
      : spotlight === 'pill'
        ? Math.min(24, (spot?.height ?? 40) / 2)
        : 14;

  return (
    <View style={styles.root} pointerEvents="box-none">
      {/* Full dim — tap does nothing (must use Skip/Next) */}
      <View style={styles.scrim} pointerEvents="auto" />

      {spot ? (
        <View
          pointerEvents="none"
          style={[
            styles.spotlight,
            {
              left: spot.x,
              top: spot.y,
              width: spot.width,
              height: spot.height,
              borderRadius: radius,
            },
          ]}
        />
      ) : null}

      <View
        style={[styles.cardWrap, { top: cardTop, left: cardLeft, width: cardWidth }]}
        pointerEvents="box-none"
      >
        {placeBelow ? (
          <View style={[styles.caretUp, { left: caretLeft - cardLeft }]} />
        ) : null}

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name={icon} size={22} color={colors.buttonPrimary} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          <Text style={styles.stepText}>
            {t('coach.stepOf', { current: stepIndex + 1, total: stepCount })}
          </Text>

          {/* Skip left · Next/Done right — matches product-tour reference */}
          <View style={styles.actions}>
            <Pressable
              onPress={onSkip}
              style={styles.skipButton}
              accessibilityRole="button"
              accessibilityLabel={t('coach.skip')}
              hitSlop={8}
            >
              <Text style={styles.skipText}>{t('coach.skip')}</Text>
            </Pressable>

            <Pressable
              onPress={onNext}
              style={styles.nextButton}
              accessibilityRole="button"
              accessibilityLabel={isLast ? t('coach.done') : t('coach.next')}
            >
              <Text style={styles.nextText}>
                {isLast ? t('coach.done') : t('coach.next')}
              </Text>
            </Pressable>
          </View>
        </View>

        {!placeBelow ? (
          <View style={[styles.caretDown, { left: caretLeft - cardLeft }]} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
  },
  spotlight: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  cardWrap: {
    position: 'absolute',
  },
  caretUp: {
    width: 0,
    height: 0,
    marginBottom: -1,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  caretDown: {
    width: 0,
    height: 0,
    marginTop: -1,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tabIconActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...uiText(17, 'semiBold'),
    color: colors.textPrimary,
  },
  body: {
    ...uiText(14, 'regular'),
    color: colors.textSecondary,
  },
  stepText: {
    ...uiText(13, 'medium'),
    color: colors.textMuted,
    marginTop: 2,
  },
  actions: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    minWidth: 64,
  },
  skipText: {
    ...uiText(14, 'semiBold'),
    color: colors.textMuted,
  },
  nextButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 96,
    alignItems: 'center',
  },
  nextText: {
    ...font('semiBold'),
    fontSize: 14,
    lineHeight: 20,
    color: colors.buttonText,
  },
});
