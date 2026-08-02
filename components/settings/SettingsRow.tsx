import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { PressableScale } from '../PressableScale';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

type SettingsRowProps = {
  title: string;
  description: string;
  showChevron?: boolean;
  onPress?: () => void;
};

export function SettingsRow({ title, description, showChevron = false, onPress }: SettingsRowProps) {
  const content = (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        {showChevron ? (
          <Ionicons name="chevron-forward" size={22} color="#1E1E1E" />
        ) : null}
      </View>
      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>
    </View>
  );

  if (!onPress) {
    return <View style={styles.rowWrap}>{content}</View>;
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      pressedScale={0.99}
      pressedOpacity={0.92}
      style={styles.rowWrap}
    >
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.background,
  },
  container: {
    width: '100%',
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  title: {
    flex: 1,
    ...uiText(16, 'semiBold'),
    color: '#1E1E1E',
  },
  description: {
    ...uiText(13, 'regular'),
    color: '#757575',
    paddingRight: 28,
  },
});
