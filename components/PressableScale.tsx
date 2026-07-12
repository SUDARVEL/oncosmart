import { useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  /** Scale when pressed. Default 0.97 */
  pressedScale?: number;
  /** Opacity when pressed. Default 0.92 */
  pressedOpacity?: number;
};

/**
 * CTA press feedback — slight scale + opacity spring so taps feel responsive.
 */
export function PressableScale({
  children,
  style,
  disabled,
  pressedScale = 0.97,
  pressedOpacity = 0.92,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const animatePress = (pressed: boolean) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: pressed ? pressedScale : 1,
        friction: 6,
        tension: 320,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: pressed ? pressedOpacity : 1,
        duration: pressed ? 70 : 140,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={(event) => {
        if (!disabled) animatePress(true);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animatePress(false);
        onPressOut?.(event);
      }}
      style={[style, { transform: [{ scale }], opacity }]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
