import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
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
  /** Window-relative target rect for highlight + card placement. */
  target: CoachTargetRect | null;
  preferPlacement: 'below' | 'above';
  spotlight?: CoachSpotlightShape;
  pad?: number;
  onNext: () => void;
  onSkip: () => void;
};

const CARD_MAX_WIDTH = 320;
const CARD_MARGIN = 20;
const GAP = 14;

function spotlightRadius(
  shape: CoachSpotlightShape | undefined,
  width: number,
  height: number,
): number {
  if (shape === 'circle') return Math.max(width, height) / 2;
  if (shape === 'pill') return Math.min(width, height) / 2;
  return 12;
}

/**
 * In-tree overlay (not a Modal) so measureInWindow coords match the highlight.
 * Avoids Android Modal window-offset misalignment.
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
  const [cardHeight, setCardHeight] = useState(200);

  if (!visible) return null;

  const isLast = stepIndex >= stepCount - 1;
  const cardWidth = Math.min(CARD_MAX_WIDTH, screenW - CARD_MARGIN * 2);
  const estimatedCardH = Math.max(160, cardHeight);

  let cardTop = Math.max(insets.top + 72, screenH * 0.22);
  let cardLeft = (screenW - cardWidth) / 2;
  let placeBelow = preferPlacement === 'below';
  let showCaret = false;
  let caretLeft = cardWidth / 2 - 8;

  const hasTarget = Boolean(target && target.width > 0 && target.height > 0);

  const highlight = hasTarget && target
    ? {
        left: target.x - pad,
        top: target.y - pad,
        width: target.width + pad * 2,
        height: target.height + pad * 2,
        borderRadius: spotlightRadius(
          spotlight,
          target.width + pad * 2,
          target.height + pad * 2,
        ),
      }
    : null;

  if (hasTarget && target) {
    const highlightBottom = target.y + target.height + pad;
    const highlightTop = target.y - pad;
    const spaceBelow = screenH - insets.bottom - highlightBottom;
    const spaceAbove = highlightTop - insets.top;

    if (preferPlacement === 'below' && spaceBelow > estimatedCardH + GAP) {
      placeBelow = true;
      cardTop = highlightBottom + GAP;
      showCaret = true;
    } else if (preferPlacement === 'above' && spaceAbove > estimatedCardH + GAP) {
      placeBelow = false;
      cardTop = Math.max(insets.top + 8, highlightTop - estimatedCardH - GAP);
      showCaret = true;
    } else if (spaceBelow >= spaceAbove && spaceBelow > 140) {
      placeBelow = true;
      cardTop = highlightBottom + GAP;
      showCaret = true;
    } else if (spaceAbove > 140) {
      placeBelow = false;
      cardTop = Math.max(insets.top + 8, highlightTop - estimatedCardH - GAP);
      showCaret = true;
    } else {
      placeBelow = spaceBelow >= spaceAbove;
      cardTop = placeBelow
        ? Math.min(highlightBottom + GAP, screenH - insets.bottom - estimatedCardH - 8)
        : Math.max(insets.top + 8, highlightTop - estimatedCardH - GAP);
      showCaret = true;
    }

    const targetCenterX = target.x + target.width / 2;
    cardLeft = Math.min(
      Math.max(CARD_MARGIN, targetCenterX - cardWidth / 2),
      screenW - CARD_MARGIN - cardWidth,
    );
    caretLeft = Math.min(
      Math.max(targetCenterX - cardLeft - 8, 18),
      cardWidth - 28,
    );
  }

  const onCardLayout = (event: LayoutChangeEvent) => {
    const nextH = event.nativeEvent.layout.height;
    if (!Number.isFinite(nextH) || nextH < 1) return;
    if (Math.abs(nextH - cardHeight) > 2) setCardHeight(nextH);
  };

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable style={styles.scrim} onPress={onSkip} accessibilityRole="button" />

      {highlight ? (
        <View
          pointerEvents="none"
          style={[
            styles.highlight,
            {
              left: highlight.left,
              top: highlight.top,
              width: highlight.width,
              height: highlight.height,
              borderRadius: highlight.borderRadius,
            },
          ]}
        />
      ) : null}

      <View
        style={[styles.cardWrap, { top: cardTop, left: cardLeft, width: cardWidth }]}
        pointerEvents="box-none"
        onLayout={onCardLayout}
      >
        {showCaret && placeBelow ? (
          <View style={[styles.caretUp, { left: caretLeft }]} />
        ) : null}

        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Ionicons name={icon} size={22} color={colors.buttonPrimary} />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          <Text style={styles.body}>{body}</Text>

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

            <View style={styles.actionsRight}>
              <Text style={styles.stepText}>
                {t('coach.stepOf', { current: stepIndex + 1, total: stepCount })}
              </Text>
              <Pressable
                onPress={onNext}
                style={styles.nextButton}
                accessibilityRole="button"
                accessibilityLabel={isLast ? t('coach.done') : t('coach.next')}
              >
                <Text style={styles.nextText}>
                  {isLast ? t('coach.done') : `${t('coach.next')} →`}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {showCaret && !placeBelow ? (
          <View style={[styles.caretDown, { left: caretLeft }]} />
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
  highlight: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    flex: 1,
    ...uiText(17, 'semiBold'),
    color: colors.textPrimary,
  },
  body: {
    ...uiText(14, 'regular'),
    color: colors.textSecondary,
  },
  actions: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    minWidth: 56,
  },
  skipText: {
    ...uiText(14, 'semiBold'),
    color: colors.textMuted,
  },
  stepText: {
    ...uiText(13, 'medium'),
    color: colors.textMuted,
  },
  nextButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  nextText: {
    ...font('semiBold'),
    fontSize: 14,
    lineHeight: 20,
    color: colors.buttonText,
  },
});
