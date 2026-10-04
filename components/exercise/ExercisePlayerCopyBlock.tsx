import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { exercisePlayerCopyStyles } from '../../lib/exercisePlayerCopyStyles';
import { ExerciseRepCounter } from './ExerciseRepCounter';

type Props = {
  title: string;
  description: string;
  displayValue: string;
  unitLabel: string;
  /**
   * Lines to show before “View more”. Omit to always show the full instruction
   * (workout sheet, which already scrolls).
   */
  collapsedLines?: number;
};

/** Title + rep counter + description block shared by exercise player screens. */
export function ExercisePlayerCopyBlock({
  title,
  description,
  displayValue,
  unitLabel,
  collapsedLines = 0,
}: Props) {
  const { t } = useTranslation();
  const displayTitle = title.toLocaleUpperCase();
  const [expanded, setExpanded] = useState(false);
  const [fullLines, setFullLines] = useState(0);
  const canCollapse = collapsedLines > 0 && fullLines > collapsedLines;
  const showCollapsed =
    collapsedLines > 0 && !expanded && (fullLines === 0 || fullLines > collapsedLines);

  useEffect(() => {
    setExpanded(false);
    setFullLines(0);
  }, [description]);

  const toggleExpanded = () => {
    setExpanded((value) => !value);
  };

  return (
    <View style={exercisePlayerCopyStyles.copyBlock}>
      <View style={exercisePlayerCopyStyles.titleWrap}>
        <Text style={exercisePlayerCopyStyles.exerciseTitle} numberOfLines={2}>
          {displayTitle}
        </Text>
      </View>

      <ExerciseRepCounter value={displayValue} unitLabel={unitLabel} />

      <View style={exercisePlayerCopyStyles.descriptionWrap}>
        {collapsedLines > 0 ? (
          <Text
            style={[
              exercisePlayerCopyStyles.description,
              exercisePlayerCopyStyles.descriptionMeasure,
            ]}
            accessible={false}
            importantForAccessibility="no"
            pointerEvents="none"
            onTextLayout={(event) => {
              const count = event.nativeEvent.lines.length;
              setFullLines((current) => (current === count ? current : count));
            }}
          >
            {description}
          </Text>
        ) : null}
        <Text
          style={exercisePlayerCopyStyles.description}
          numberOfLines={showCollapsed ? collapsedLines : undefined}
        >
          {description}
        </Text>
      </View>

      {canCollapse ? (
        <Pressable
          style={exercisePlayerCopyStyles.moreButton}
          onPress={toggleExpanded}
          accessibilityRole="button"
          accessibilityLabel={expanded ? t('sessionFlow.viewLess') : t('sessionFlow.viewMore')}
          hitSlop={8}
        >
          <Text style={exercisePlayerCopyStyles.moreLabel}>
            {expanded ? t('sessionFlow.viewLess') : t('sessionFlow.viewMore')}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#005F99"
          />
        </Pressable>
      ) : null}
    </View>
  );
}
