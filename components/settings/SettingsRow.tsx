import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';
import { PressableScale } from '../PressableScale';

type SettingsRowProps = {
  title: string;
  description: string;
  showChevron?: boolean;
  onPress?: () => void;
};

/** Compact settings row — less vertical whitespace, full-width layout. */
export function SettingsRow({ title, description, showChevron = false, onPress }: SettingsRowProps) {
  const content = (
    <View style={styles.inner}>
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      </View>
      {showChevron ? (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      ) : null}
    </View>
  );

  if (!onPress) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      pressedScale={0.995}
      pressedOpacity={0.92}
      style={styles.row}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: 'stretch',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  inner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...uiText(15, 'semiBold'),
    color: '#1E1E1E',
  },
  description: {
    ...uiText(12, 'regular'),
    color: '#757575',
  },
});
