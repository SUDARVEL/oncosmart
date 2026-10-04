import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { COACH_TOUR_BEAT_MS, type CoachSpotlightShape } from '../../lib/coachTour';
import { font } from '../../theme/fonts';

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
  /** Called when this beat finishes. The tour advances itself. */
  onNext: () => void;
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
 * In-tree fullscreen overlay that plays like the walkthrough recording:
 * the tip appears, the ring pulses, and the next screen opens on its own.
 * Target rects MUST be host-relative (see useCoachTour).
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
}: Props) {
  const [cardHeight, setCardHeight] = useState(160);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const [trackWidth, setTrackWidth] = useState(0);
  const [progress, setProgress] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  const hasTarget = Boolean(target && target.width > 0 && target.height > 0);

  useEffect(() => {
    if (!visible) return;
    slide.setValue(12);
    const slideAnim = Animated.timing(slide, {
      toValue: 0,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    slideAnim.start();
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();
    return () => {
      slideAnim.stop();
      pulseLoop.stop();
    };
  }, [visible, stepIndex, slide, pulse]);

  useEffect(() => {
    if (!visible) return;
    let movedOn = false;
    setProgress(0);
    const hold = hasTarget ? 350 : 900;
    const startedAt = Date.now() + hold;
    const timer = setInterval(() => {
      const next = Math.max(0, Math.min(1, (Date.now() - startedAt) / COACH_TOUR_BEAT_MS));
      setProgress(next);
      if (next < 1 || movedOn) return;
      movedOn = true;
      clearInterval(timer);
      onNextRef.current();
    }, 50);
    return () => {
      movedOn = true;
      clearInterval(timer);
    };
  }, [visible, stepIndex, hasTarget]);

  if (!visible) return null;

  const screenW = overlaySize.width > 0 ? overlaySize.width : 360;
  const screenH = overlaySize.height > 0 ? overlaySize.height : 720;

  const cardWidth = Math.min(CARD_MAX_WIDTH, Math.max(200, screenW - CARD_MARGIN * 2));
  const estimatedCardH = Math.max(120, cardHeight);

  let cardTop = Math.max(24, screenH * 0.22);
  let cardLeft = Math.max(CARD_MARGIN, (screenW - cardWidth) / 2);
  let placeBelow = preferPlacement === 'below';
  let showCaret = false;
  let caretLeft = cardWidth / 2 - 8;

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
    const spaceBelow = screenH - highlightBottom;
    const spaceAbove = highlightTop;

    if (preferPlacement === 'below' && spaceBelow > estimatedCardH + GAP) {
      placeBelow = true;
      cardTop = highlightBottom + GAP;
      showCaret = true;
    } else if (preferPlacement === 'above' && spaceAbove > estimatedCardH + GAP) {
      placeBelow = false;
      cardTop = Math.max(8, highlightTop - estimatedCardH - GAP);
      showCaret = true;
    } else if (spaceBelow >= spaceAbove && spaceBelow > 120) {
      placeBelow = true;
      cardTop = highlightBottom + GAP;
      showCaret = true;
    } else if (spaceAbove > 120) {
      placeBelow = false;
      cardTop = Math.max(8, highlightTop - estimatedCardH - GAP);
      showCaret = true;
    } else {
      placeBelow = spaceBelow >= spaceAbove;
      cardTop = placeBelow
        ? Math.min(highlightBottom + GAP, screenH - estimatedCardH - 8)
        : Math.max(8, highlightTop - estimatedCardH - GAP);
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

  const cardShift = placeBelow ? slide : Animated.multiply(slide, -1);

  return (
    <View
      style={styles.root}
      pointerEvents="auto"
      onLayout={onRootLayout}
      collapsable={false}
    >
      <View style={StyleSheet.absoluteFill} onStartShouldSetResponder={() => true} />
      {highlight ? (
        <>
          <View style={[styles.scrimPiece, { top: 0, left: 0, right: 0, height: Math.max(0, highlight.top) }]} />
          <View
            style={[
              styles.scrimPiece,
              {
                top: highlight.top + highlight.height,
                left: 0,
                right: 0,
                bottom: 0,
              },
            ]}
          />
          <View
            style={[
              styles.scrimPiece,
              { top: highlight.top, left: 0, width: Math.max(0, highlight.left), height: highlight.height },
            ]}
          />
          <View
            style={[
              styles.scrimPiece,
              {
                top: highlight.top,
                left: highlight.left + highlight.width,
                right: 0,
                height: highlight.height,
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.highlight,
              {
                left: highlight.left,
                top: highlight.top,
                width: highlight.width,
                height: highlight.height,
                borderRadius: highlight.borderRadius,
                opacity: pulse,
              },
            ]}
          />
        </>
      ) : (
        <View style={styles.scrim} />
      )}

      <Animated.View
        style={[
          styles.cardWrap,
          {
            top: cardTop,
            left: cardLeft,
            width: cardWidth,
            opacity: 1,
            transform: [{ translateY: cardShift }],
          },
        ]}
        pointerEvents="none"
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

          <View
            style={styles.progressTrack}
            onLayout={(event) => {
              const nextWidth = event.nativeEvent.layout.width;
              if (!Number.isFinite(nextWidth) || nextWidth < 1) return;
              if (Math.abs(nextWidth - trackWidth) > 1) setTrackWidth(nextWidth);
            }}
          >
            <View style={[styles.progressFill, { width: Math.max(0, trackWidth * progress) }]} />
          </View>
        </View>

        {showCaret && !placeBelow ? (
          <View style={[styles.caretDown, { left: caretLeft }]} />
        ) : null}
      </Animated.View>
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
    paddingBottom: 10,
    gap: 6,
    overflow: 'hidden',
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
  progressTrack: {
    marginTop: 6,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
    backgroundColor: RING,
  },
});
