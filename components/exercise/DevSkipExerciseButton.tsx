import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font } from '../../theme/fonts';

type Props = {
  exerciseNumber: number;
  totalExercises: number;
  onPress: () => void;
  /** When true, show even in production (admin demo testing). */
  enabled?: boolean;
};

/** Skip control for __DEV__ or admin testing — sits under the header. */
export function DevSkipExerciseButton({
  exerciseNumber,
  totalExercises,
  onPress,
  enabled = false,
}: Props) {
  const insets = useSafeAreaInsets();

  if (!__DEV__ && !enabled) return null;

  return (
    <View
      style={[styles.wrap, { top: insets.top + 52 }]}
      pointerEvents="box-none"
    >
      <Pressable
        style={styles.button}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Skip current exercise"
      >
        <Text style={styles.label}>{enabled && !__DEV__ ? 'ADMIN' : 'DEV'}</Text>
        <Text style={styles.text}>
          Skip ({exerciseNumber}/{totalExercises})
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    right: 12,
    zIndex: 100,
    alignItems: 'flex-end',
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C084FC',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    gap: 1,
  },
  label: {
    fontSize: 9,
    ...font('semiBold'),
    color: '#7C3AED',
    letterSpacing: 1,
  },
  text: {
    fontSize: 11,
    ...font('medium'),
    color: '#5B21B6',
    textAlign: 'center',
  },
});
