import { Text, View } from 'react-native';

import { ExerciseRepCounter } from './ExerciseRepCounter';
import { exercisePlayerCopyStyles } from '../../lib/exercisePlayerCopyStyles';

type Props = {
  title: string;
  description: string;
  displayValue: string;
  unitLabel: string;
  contentWidth: number;
};

/** Title + rep counter + description block shared by exercise player screens. */
export function ExercisePlayerCopyBlock({
  title,
  description,
  displayValue,
  unitLabel,
  contentWidth,
}: Props) {
  return (
    <View style={[exercisePlayerCopyStyles.copyBlock, { width: contentWidth }]}>
      <Text style={exercisePlayerCopyStyles.exerciseTitle}>{title}</Text>

      <ExerciseRepCounter value={displayValue} unitLabel={unitLabel} />

      <Text style={exercisePlayerCopyStyles.description}>{description}</Text>
    </View>
  );
}
