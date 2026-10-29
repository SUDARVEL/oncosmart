import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

type SkeletonBlockProps = {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

const pulse = new Animated.Value(0.45);
let pulseStarted = false;

function ensurePulse() {
  if (pulseStarted) return;
  pulseStarted = true;
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulse, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(pulse, {
        toValue: 0.45,
        duration: 750,
        useNativeDriver: true,
      }),
    ]),
  ).start();
}

/** Gray placeholder that pulses while content is still loading. */
export function SkeletonBlock({
  width = '100%',
  height = 16,
  radius = 8,
  style,
}: SkeletonBlockProps) {
  const started = useRef(false);
  if (!started.current) {
    started.current = true;
    ensurePulse();
  }

  useEffect(() => {
    ensurePulse();
  }, []);

  return (
    <Animated.View
      accessible={false}
      style={[
        styles.block,
        { width, height, borderRadius: radius, opacity: pulse },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#E5E7EB',
  },
});
