import { Text, View } from 'react-native';

import { ExerciseRepCounter } from './ExerciseRepCounter';
import { exercisePlayerCopyStyles } from '../../lib/exercisePlayerCopyStyles';

type Props = {
  title: string;
  description: string;
  displayValue: string;
  unitLabel: string;
};

/** Title + rep counter + description block shared by exercise player screens. */
export function ExercisePlayerCopyBlock({
  title,
  description,
  displayValue,
  unitLabel,
}: Props) {
  const displayTitle = title.toLocaleUpperCase();

  return (
    <View style={exercisePlayerCopyStyles.copyBlock}>
      <View style={exercisePlayerCopyStyles.titleWrap}>
        <Text style={exercisePlayerCopyStyles.exerciseTitle} numberOfLines={2}>
          {displayTitle}
        </Text>
      </View>

      <ExerciseRepCounter value={displayValue} unitLabel={unitLabel} />

      <Text style={exercisePlayerCopyStyles.description}>{description}</Text>
    </View>
  );
}
