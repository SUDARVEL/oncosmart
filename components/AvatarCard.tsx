import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

type AvatarCardProps = {
  image: number;
  selected: boolean;
  onPress: () => void;
};

export function AvatarCard({ image, selected, onPress }: AvatarCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Image source={image} style={styles.image} contentFit="contain" />
      {selected ? (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark-circle" size={20} color={colors.buttonPrimary} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 379,
    borderRadius: 8,
    backgroundColor: colors.optionBg,
    padding: 8,
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 1,
    borderColor: colors.optionBorderSelected,
  },
  image: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
