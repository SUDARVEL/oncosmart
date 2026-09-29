import { Text, View } from 'react-native';

import { exercisePlayerCopyStyles } from '../../lib/exercisePlayerCopyStyles';

type Props = {
  value: string;
  unitLabel: string;
};

/** Rep count row — natural height, no clipping containers. */
export function ExerciseRepCounter({ value, unitLabel }: Props) {
  return (
    <View style={exercisePlayerCopyStyles.repSection}>
      <View style={exercisePlayerCopyStyles.repRow}>
        <Text style={exercisePlayerCopyStyles.repValue} numberOfLines={1}>
          {value}
        </Text>
        <Text style={exercisePlayerCopyStyles.repLabel} numberOfLines={1}>
          {unitLabel}
        </Text>
      </View>
    </View>
  );
}
