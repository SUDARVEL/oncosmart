import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

type LanguageCardProps = {
  label: string;
  glyph: string;
  selected: boolean;
  onPress: () => void;
};

export function LanguageCard({ label, glyph, selected, onPress }: LanguageCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      <Text style={[styles.glyph, selected && styles.glyphSelected]}>{glyph}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 126,
    height: 97,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 8,
    paddingVertical: 12,
  },
  cardSelected: {
    borderColor: colors.optionBorderSelected,
    backgroundColor: colors.optionBgSelected,
  },
  label: {
    fontSize: 14,
    ...font('medium'),
    color: colors.optionTextUnselected,
    letterSpacing: 0.1,
  },
  labelSelected: {
    ...font('semiBold'),
    color: colors.optionTextSelected,
  },
  glyph: {
    fontSize: 40,
    ...font('medium'),
    color: colors.optionTextUnselected,
    lineHeight: 48,
  },
  glyphSelected: {
    ...font('semiBold'),
    color: colors.optionTextSelected,
  },
});
