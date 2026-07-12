import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

type SelectOptionProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectOption({ label, selected, onPress }: SelectOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.pressable}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      {selected ? (
        <View style={styles.optionSelected}>
          <Text style={styles.labelSelected}>{label}</Text>
        </View>
      ) : (
        <LinearGradient
          colors={['#FFFFFF', colors.optionBg]}
          style={styles.optionUnselected}
        >
          <Text style={styles.labelUnselected}>{label}</Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
    minHeight: 52,
    borderRadius: 10,
    overflow: 'hidden',
  },
  optionUnselected: {
    flex: 1,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
  },
  optionSelected: {
    flex: 1,
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: colors.optionBgSelected,
    borderWidth: 1.5,
    borderColor: colors.optionBorderSelected,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  labelUnselected: {
    fontSize: 16,
    ...font('regular'),
    color: colors.optionTextUnselected,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  labelSelected: {
    fontSize: 16,
    ...font('semiBold'),
    color: colors.optionTextSelected,
    letterSpacing: 0.1,
    lineHeight: 22,
  },
});
