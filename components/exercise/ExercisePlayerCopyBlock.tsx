import { Platform, Text, View } from 'react-native';

import { ExerciseRepCounter } from './ExerciseRepCounter';
import { exercisePlayerCopyStyles } from '../../lib/exercisePlayerCopyStyles';

type Props = {
  title: string;
  description: string;
  displayValue: string;
  unitLabel: string;
  /** Max width aligned with the video frame above (scroll column still uses 100% width). */
  contentWidth?: number;
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
    <View
      style={[
        exercisePlayerCopyStyles.copyBlock,
        contentWidth != null ? { maxWidth: contentWidth } : null,
      ]}
    >
      <View style={exercisePlayerCopyStyles.titleWrap}>
        <Text
          style={exercisePlayerCopyStyles.exerciseTitle}
          numberOfLines={2}
          adjustsFontSizeToFit={Platform.OS !== 'web'}
          minimumFontScale={0.82}
          {...(Platform.OS === 'android' ? { textBreakStrategy: 'simple' as const } : {})}
        >
          {title}
        </Text>
      </View>

      <ExerciseRepCounter value={displayValue} unitLabel={unitLabel} />

      <Text style={exercisePlayerCopyStyles.description}>{description}</Text>
    </View>
  );
}
