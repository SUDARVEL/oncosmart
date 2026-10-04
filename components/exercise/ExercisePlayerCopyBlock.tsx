import { StyleSheet, Text, View } from 'react-native';

import { exercisePlayerCopyStyles } from '../../lib/exercisePlayerCopyStyles';
import { uiText } from '../../theme/typography';
import { ExerciseRepCounter } from './ExerciseRepCounter';

type Props = {
  title: string;
  description: string;
  displayValue: string;
  unitLabel: string;
  /** Keep the instruction inside the space above the action buttons. */
  compact?: boolean;
};

/** Title + rep counter + description block shared by exercise player screens. */
export function ExercisePlayerCopyBlock({
  title,
  description,
  displayValue,
  unitLabel,
  compact = false,
}: Props) {
  const displayTitle = title.toLocaleUpperCase();

  return (
    <View style={[exercisePlayerCopyStyles.copyBlock, compact && styles.compactBlock]}>
      <View style={exercisePlayerCopyStyles.titleWrap}>
        <Text
          style={[exercisePlayerCopyStyles.exerciseTitle, compact && styles.compactTitle]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {displayTitle}
        </Text>
      </View>

      <ExerciseRepCounter value={displayValue} unitLabel={unitLabel} compact={compact} />

      <Text
        style={[exercisePlayerCopyStyles.description, compact && styles.compactDescription]}
        numberOfLines={compact ? 5 : undefined}
        adjustsFontSizeToFit={compact}
        minimumFontScale={0.78}
      >
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compactBlock: {
    flexShrink: 1,
  },
  compactTitle: {
    ...uiText(20, 'semiBold'),
    textAlign: 'center',
    color: '#262526',
    letterSpacing: 0.1,
  },
  compactDescription: {
    ...uiText(14),
    textAlign: 'center',
    color: '#6B7280',
    letterSpacing: 0.1,
    marginTop: 2,
  },
});
