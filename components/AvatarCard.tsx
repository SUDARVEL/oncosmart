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
      <Image source={image} style={styles.image} contentFit="cover" />
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
    height: 410,
    borderRadius: 8,
    backgroundColor: colors.optionBg,
    // Reduce padding so the avatar image fills more of the card.
    padding: 0,
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
    height: '100%',
    backgroundColor: 'transparent',
    // Make the avatar figure fill more of the card area.
    transform: [{ scale: 1.08 }],
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
