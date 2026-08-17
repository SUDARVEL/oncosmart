import { Text, View } from 'react-native';

import { displayFontStyle } from '../../theme/fonts';
import { exercisePlayerCopyStyles } from '../../lib/exercisePlayerCopyStyles';

type Props = {
  value: string;
  unitLabel: string;
};

/**
 * Isolated rep counter so large Antonio digits cannot overlap the description.
 * Each text node sits in its own clipped box (Android ignores parent overflow alone).
 */
export function ExerciseRepCounter({ value, unitLabel }: Props) {
  return (
    <View style={exercisePlayerCopyStyles.repSection}>
      <View style={exercisePlayerCopyStyles.repRowClip}>
        <View style={exercisePlayerCopyStyles.repRow}>
          <View style={exercisePlayerCopyStyles.repValueClip}>
            <Text
              style={[exercisePlayerCopyStyles.repValue, displayFontStyle()]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              {value}
            </Text>
          </View>
          <View style={exercisePlayerCopyStyles.repLabelClip}>
            <Text style={exercisePlayerCopyStyles.repLabel} numberOfLines={1}>
              {unitLabel}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
