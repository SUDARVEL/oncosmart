import { StyleSheet, Text, View } from 'react-native';

import { exercisePlayerCopyStyles } from '../../lib/exercisePlayerCopyStyles';
import { displayFontStyle, font } from '../../theme/fonts';

type Props = {
  value: string;
  unitLabel: string;
  compact?: boolean;
};

/** Rep count row — natural height, no clipping containers. */
export function ExerciseRepCounter({ value, unitLabel, compact = false }: Props) {
  return (
    <View style={[exercisePlayerCopyStyles.repSection, compact && styles.compactSection]}>
      <View style={exercisePlayerCopyStyles.repRow}>
        <Text
          style={[exercisePlayerCopyStyles.repValue, compact && styles.compactValue]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {value}
        </Text>
        <Text
          style={[exercisePlayerCopyStyles.repLabel, compact && styles.compactLabel]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {unitLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactSection: {
    marginTop: 4,
    marginBottom: 6,
  },
  compactValue: {
    fontSize: 48,
    lineHeight: 52,
    ...displayFontStyle(),
  },
  compactLabel: {
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 4,
    ...font('bold'),
  },
});
