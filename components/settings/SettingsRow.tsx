import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { font } from '../../theme/fonts';

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
        <Text style={styles.title}>{title}</Text>
        {showChevron ? (
          <Ionicons name="chevron-forward" size={24} color="#1E1E1E" />
        ) : null}
      </View>
      <Text style={styles.description}>{description}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1E1E1E',
    ...font('regular'),
  },
  description: {
    fontSize: 16,
    lineHeight: 22.4,
    color: '#757575',
    ...font('regular'),
  },
});
