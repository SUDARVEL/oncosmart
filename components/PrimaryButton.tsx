import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'muted';
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        variant === 'muted' && styles.buttonMuted,
        disabled && styles.buttonDisabled,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  buttonMuted: {
    backgroundColor: colors.buttonMuted,
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },
  label: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.buttonText,
    letterSpacing: 0.1,
  },
});
