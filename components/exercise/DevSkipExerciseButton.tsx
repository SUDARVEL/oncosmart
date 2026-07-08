import { Pressable, StyleSheet, Text, View } from 'react-native';

import { font } from '../../theme/fonts';

type Props = {
  exerciseNumber: number;
  totalExercises: number;
  onPress: () => void;
};

export function DevSkipExerciseButton({ exerciseNumber, totalExercises, onPress }: Props) {
  if (!__DEV__) return null;

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable
        style={styles.button}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Skip current exercise"
      >
        <Text style={styles.label}>DEV</Text>
        <Text style={styles.text}>
          Skip exercise ({exerciseNumber}/{totalExercises})
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 100,
    zIndex: 100,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C084FC',
    backgroundColor: 'rgba(192, 132, 252, 0.12)',
    alignItems: 'center',
    gap: 2,
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
