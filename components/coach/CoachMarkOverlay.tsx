import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CoachSpotlightShape } from '../../lib/coachTour';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { uiText } from '../../theme/typography';

export type CoachTargetRect = {
  /** Host-relative X (same coordinate space as this absolute overlay). */
  x: number;
  /** Host-relative Y (same coordinate space as this absolute overlay). */
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
  /** Host-relative target rect for highlight + card placement. */
  target: CoachTargetRect | null;
  preferPlacement: 'below' | 'above';
  spotlight?: CoachSpotlightShape;
  pad?: number;
  onNext: () => void;
  onSkip: () => void;
};

const CARD_MAX_WIDTH = 280;
const CARD_MARGIN = 16;
const GAP = 12;
const RING = '#2457A6';

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
 * In-tree fullscreen overlay.
 * Target rects MUST be host-relative (see useCoachTour) so the ring sits
 * exactly on the measured control on every device.
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
  const insets = useSafeAreaInsets();
  const [cardHeight, setCardHeight] = useState(200);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });

  if (!visible) return null;

  const screenW = overlaySize.width > 0 ? overlaySize.width : 360;
  const screenH = overlaySize.height > 0 ? overlaySize.height : 720;

  const cardWidth = Math.min(CARD_MAX_WIDTH, Math.max(200, screenW - CARD_MARGIN * 2));
  const estimatedCardH = Math.max(160, cardHeight);

  let cardTop = Math.max(insets.top + 72, screenH * 0.22);
  let cardLeft = Math.max(CARD_MARGIN, (screenW - cardWidth) / 2);
  let placeBelow = preferPlacement === 'below';
  let showCaret = false;
  let caretLeft = cardWidth / 2 - 8;

  const hasTarget = Boolean(target && target.width > 0 && target.height > 0);

  // 1:1 with host-relative measure — no safe-area clamp that shifts the ring.
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
      Math.max(CARD_MARGIN, screenW - CARD_MARGIN - cardWidth),
    );
    caretLeft = Math.min(
      Math.max(targetCenterX - cardLeft - 8, 18),
      cardWidth - 28,
    );
  }

  const onRootLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) return;
    if (
      Math.abs(width - overlaySize.width) > 1 ||
      Math.abs(height - overlaySize.height) > 1
    ) {
      setOverlaySize({ width, height });
    }
  };

  const onCardLayout = (event: LayoutChangeEvent) => {
    const nextH = event.nativeEvent.layout.height;
    if (!Number.isFinite(nextH) || nextH < 1) return;
    if (Math.abs(nextH - cardHeight) > 2) setCardHeight(nextH);
  };

  return (
    <View
      style={styles.root}
      pointerEvents="box-none"
      onLayout={onRootLayout}
      collapsable={false}
    >
      {highlight ? (
        <>
          <Pressable
            style={[styles.scrimPiece, { top: 0, left: 0, right: 0, height: Math.max(0, highlight.top) }]}
            onPress={onSkip}
          />
          <Pressable
            style={[
              styles.scrimPiece,
              {
                top: highlight.top + highlight.height,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
            onPress={onSkip}
          />
          <Pressable
            style={[
              styles.scrimPiece,
              { top: highlight.top, left: 0, width: Math.max(0, highlight.left), height: highlight.height },
            ]}
            onPress={onSkip}
          />
          <Pressable
            style={[
              styles.scrimPiece,
              {
                top: highlight.top,
                left: highlight.left + highlight.width,
                right: 0,
                height: highlight.height,
              },
            ]}
            onPress={onSkip}
          />
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
        </>
      ) : (
        <Pressable style={styles.scrim} onPress={onSkip} accessibilityRole="button" />
      )}

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
            <Ionicons name={icon} size={18} color={RING} />
            <Text style={styles.title}>{title}</Text>
          </View>

          <Text style={styles.body}>{body}</Text>

          <View style={styles.dots}>
            {Array.from({ length: stepCount }, (_, dot) => (
              <View key={dot} style={[styles.dot, dot === stepIndex && styles.dotActive]} />
            ))}
          </View>

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
              accessibilityLabel={t('coach.next')}
            >
              <Text style={styles.nextText}>{t('coach.next')}</Text>
            </Pressable>
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
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  scrimPiece: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
  },
  highlight: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: RING,
    backgroundColor: 'transparent',
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
    borderBottomColor: RING,
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
    borderTopColor: RING,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: RING,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: '#16325C',
    ...font('bold'),
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5563',
    ...font('regular'),
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RING,
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
