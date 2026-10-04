import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CoachSpotlightShape, CoachTourGesture } from '../../lib/coachTour';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

export type CoachTargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  title: string;
  body: string;
  stepIndex: number;
  stepCount: number;
  target: CoachTargetRect | null;
  preferPlacement: 'below' | 'above';
  spotlight?: CoachSpotlightShape;
  pad?: number;
  gesture?: CoachTourGesture;
  finale?: boolean;
  onSkip: () => void;
};

const CARD_MARGIN = 20;
const GAP = 14;
const RING = '#005F99';
const DIM = 'rgba(3, 18, 36, 0.55)';

function spotlightRadius(
  shape: CoachSpotlightShape | undefined,
  width: number,
  height: number,
): number {
  if (shape === 'circle') return Math.max(width, height) / 2;
  if (shape === 'pill') return Math.min(width, height) / 2;
  return 16;
}

/**
 * Soft spotlight over the real screen. The tour moves itself.
 * Skip Tour stays in the top corner and fades the overlay away.
 */
export function CoachMarkOverlay({
  title,
  body,
  stepIndex,
  stepCount,
  target,
  preferPlacement,
  spotlight = 'rounded',
  pad = 8,
  gesture = 'none',
  finale = false,
  onSkip,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [cardHeight, setCardHeight] = useState(140);
  const [overlaySize, setOverlaySize] = useState({ width: 0, height: 0 });
  const overlayOpacity = useRef(new Animated.Value(1)).current;
  const cardShift = useRef(new Animated.Value(0)).current;
  const skipEnter = useRef(new Animated.Value(0)).current;
  const skipScale = useRef(new Animated.Value(1)).current;
  const skipRipple = useRef(new Animated.Value(0)).current;
  const skippingRef = useRef(false);
  const onSkipRef = useRef(onSkip);
  onSkipRef.current = onSkip;

  const hasTarget = Boolean(target && target.width > 0 && target.height > 0);

  useEffect(() => {
    cardShift.setValue(12);
    Animated.timing(cardShift, {
      toValue: 0,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [stepIndex, finale, cardShift]);

  useEffect(() => {
    skipEnter.setValue(0);
    Animated.timing(skipEnter, {
      toValue: 1,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [skipEnter]);

  const handleSkip = () => {
    if (skippingRef.current) return;
    skippingRef.current = true;
    skipRipple.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(skipScale, {
          toValue: 0.9,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(skipScale, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(skipRipple, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 320,
        delay: 70,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onSkipRef.current();
    });
  };

  const screenW = overlaySize.width > 0 ? overlaySize.width : 360;
  const screenH = overlaySize.height > 0 ? overlaySize.height : 720;
  const cardWidth = Math.min(340, Math.max(220, screenW - CARD_MARGIN * 2));
  const estimatedCardH = Math.max(110, cardHeight);

  let cardTop = Math.max(insets.top + 72, (screenH - estimatedCardH) / 2);
  let cardLeft = Math.max(CARD_MARGIN, (screenW - cardWidth) / 2);
  let placeBelow = preferPlacement === 'below';

  const highlight = !finale && hasTarget && target
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

  if (highlight) {
    const highlightBottom = highlight.top + highlight.height;
    const highlightTop = highlight.top;
    const spaceBelow = screenH - highlightBottom;
    const spaceAbove = highlightTop;

    if (preferPlacement === 'below' && spaceBelow > estimatedCardH + GAP + 24) {
      placeBelow = true;
      cardTop = highlightBottom + GAP;
    } else if (preferPlacement === 'above' && spaceAbove > estimatedCardH + GAP + insets.top) {
      placeBelow = false;
      cardTop = Math.max(insets.top + 64, highlightTop - estimatedCardH - GAP);
    } else if (spaceBelow >= spaceAbove) {
      placeBelow = true;
      cardTop = Math.min(highlightBottom + GAP, screenH - estimatedCardH - 16);
    } else {
      placeBelow = false;
      cardTop = Math.max(insets.top + 64, highlightTop - estimatedCardH - GAP);
    }

    const targetCenterX = target ? target.x + target.width / 2 : screenW / 2;
    cardLeft = Math.min(
      Math.max(CARD_MARGIN, targetCenterX - cardWidth / 2),
      Math.max(CARD_MARGIN, screenW - CARD_MARGIN - cardWidth),
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

  const filledBeats = finale ? stepCount : stepIndex;

  return (
    <Animated.View
      style={[styles.root, { opacity: overlayOpacity }]}
      pointerEvents="box-none"
      onLayout={onRootLayout}
      collapsable={false}
    >
      <View style={StyleSheet.absoluteFill} onStartShouldSetResponder={() => true} />

      {highlight ? (
        <>
          <View style={[styles.dim, { top: 0, left: 0, right: 0, height: Math.max(0, highlight.top) }]} />
          <View
            style={[
              styles.dim,
              { top: highlight.top + highlight.height, left: 0, right: 0, bottom: 0 },
            ]}
          />
          <View
            style={[
              styles.dim,
              { top: highlight.top, left: 0, width: Math.max(0, highlight.left), height: highlight.height },
            ]}
          />
          <View
            style={[
              styles.dim,
              {
                top: highlight.top,
                left: highlight.left + highlight.width,
                right: 0,
                height: highlight.height,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.ring,
              {
                left: highlight.left,
                top: highlight.top,
                width: highlight.width,
                height: highlight.height,
                borderRadius: highlight.borderRadius,
              },
            ]}
          />
          {gesture !== 'none' && target ? (
            <FingerCue
              x={target.x + target.width / 2}
              y={target.y + target.height / 2}
              gesture={gesture}
            />
          ) : null}
        </>
      ) : (
        <View style={[styles.dim, finale ? styles.dimSoft : null, StyleSheet.absoluteFillObject]} />
      )}

      <View
        pointerEvents="box-none"
        style={[styles.topBar, { top: insets.top + 8, left: 16, right: 16 }]}
      >
        <View style={styles.segments}>
          {Array.from({ length: stepCount }, (_, index) => (
            <View
              key={index}
              style={[styles.segment, index <= filledBeats ? styles.segmentOn : null]}
            />
          ))}
        </View>
        <Animated.View
          style={{
            opacity: skipEnter,
            transform: [
              {
                translateY: skipEnter.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 0],
                }),
              },
              { scale: skipScale },
            ],
          }}
        >
          <Pressable
            onPress={handleSkip}
            style={styles.skip}
            accessibilityRole="button"
            accessibilityLabel={t('coach.skipTour')}
          >
            <Animated.View
              pointerEvents="none"
              style={[
                styles.skipRipple,
                {
                  opacity: skipRipple.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.35, 0],
                  }),
                  transform: [
                    {
                      scale: skipRipple.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.4, 1.8],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Text style={styles.skipText}>{t('coach.skipTour')}</Text>
          </Pressable>
        </Animated.View>
      </View>

      <Animated.View
        pointerEvents="none"
        onLayout={onCardLayout}
        style={[
          styles.card,
          {
            top: cardTop,
            left: cardLeft,
            width: cardWidth,
            transform: [{ translateY: placeBelow ? cardShift : Animated.multiply(cardShift, -1) }],
          },
        ]}
      >
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </Animated.View>
    </Animated.View>
  );
}

function FingerCue({
  x,
  y,
  gesture,
}: {
  x: number;
  y: number;
  gesture: CoachTourGesture;
}) {
  const motion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    motion.setValue(0);
    const loop = Animated.loop(
      Animated.timing(motion, {
        toValue: 1,
        duration: gesture === 'swipe' ? 1100 : 900,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [gesture, motion, x, y]);

  const travel = gesture === 'swipe'
    ? motion.interpolate({ inputRange: [0, 1], outputRange: [-28, 28] })
    : motion.interpolate({ inputRange: [0, 0.65, 1], outputRange: [-26, 0, -8] });
  const press = gesture === 'tap'
    ? motion.interpolate({ inputRange: [0, 0.65, 0.8, 1], outputRange: [1, 1, 0.86, 1] })
    : motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1] });
  const rippleOpacity = gesture === 'tap'
    ? motion.interpolate({ inputRange: [0.6, 0.75, 1], outputRange: [0, 0.45, 0] })
    : 0;
  const rippleScale = motion.interpolate({ inputRange: [0.6, 1], outputRange: [0.5, 1.7] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.finger,
        {
          left: x - 18,
          top: y - 8,
          transform: [
            gesture === 'swipe' ? { translateX: travel } : { translateY: travel },
            { scale: press },
          ],
        },
      ]}
    >
      {gesture === 'tap' ? (
        <Animated.View
          style={[
            styles.fingerRipple,
            { opacity: rippleOpacity, transform: [{ scale: rippleScale }] },
          ]}
        />
      ) : null}
      <View style={styles.fingertip} />
      <View style={styles.fingerStem} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  dim: {
    position: 'absolute',
    backgroundColor: DIM,
  },
  dimSoft: {
    backgroundColor: 'rgba(3, 18, 36, 0.28)',
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: RING,
    backgroundColor: 'transparent',
  },
  topBar: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  segmentOn: {
    backgroundColor: '#FFFFFF',
  },
  skip: {
    overflow: 'hidden',
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipRipple: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 95, 153, 0.28)',
  },
  skipText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.navy,
    ...font('semiBold'),
  },
  card: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 6,
    shadowColor: '#003B71',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    color: colors.navy,
    ...font('bold'),
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    textAlign: 'center',
    color: '#4B5563',
    ...font('regular'),
  },
  finger: {
    position: 'absolute',
    width: 36,
    height: 64,
    alignItems: 'center',
    zIndex: 3,
  },
  fingerRipple: {
    position: 'absolute',
    top: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 95, 153, 0.35)',
  },
  fingertip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: RING,
  },
  fingerStem: {
    width: 16,
    height: 28,
    marginTop: -6,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderTopWidth: 0,
    borderColor: RING,
  },
});
