import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

type YesNoValue = boolean | null;

type YesNoToggleProps = {
  value: YesNoValue;
  onChange: (value: boolean) => void;
  yesLabel: string;
  noLabel: string;
};

type ToggleButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

function ToggleButton({ label, selected, onPress }: ToggleButtonProps) {
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

export function YesNoToggle({ value, onChange, yesLabel, noLabel }: YesNoToggleProps) {
  return (
    <View style={styles.row}>
      <ToggleButton
        label={yesLabel}
        selected={value === true}
        onPress={() => onChange(true)}
      />
      <ToggleButton
        label={noLabel}
        selected={value === false}
        onPress={() => onChange(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  pressable: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
  },
  optionUnselected: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionSelected: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.optionBgSelected,
    borderWidth: 1,
    borderColor: colors.optionBorderSelected,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  labelUnselected: {
    fontSize: 14,
    ...font('medium'),
    color: colors.optionTextUnselected,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelSelected: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.optionTextSelected,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
});
