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

export function SettingsRow({ title, description, showChevron = false, onPress }: SettingsRowProps) {
  const content = (
    <View style={styles.inner}>
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>
      </View>
      {showChevron ? (
        <Ionicons name="chevron-forward" size={22} color="#1E1E1E" style={styles.chevron} />
      ) : (
        <View style={styles.chevronSpacer} />
      )}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  inner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  title: {
    ...uiText(16, 'semiBold'),
    color: '#1E1E1E',
  },
  description: {
    ...uiText(13, 'regular'),
    color: '#757575',
  },
  chevron: {
    flexShrink: 0,
  },
  chevronSpacer: {
    width: 22,
  },
});
