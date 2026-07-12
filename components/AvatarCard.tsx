import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

/** Figma avatar display size inside each choose-avatar card. */
export const AVATAR_DISPLAY_WIDTH = 143;
export const AVATAR_DISPLAY_HEIGHT = 363;

type AvatarCardProps = {
  image: ImageSource;
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
      <View style={styles.imageFrame}>
        <Image
          source={image}
          style={styles.image}
          contentFit="contain"
          contentPosition="center"
          cachePolicy="memory-disk"
          recyclingKey={typeof image === 'number' ? `avatar-${image}` : undefined}
        />
      </View>
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 1,
    borderColor: colors.optionBorderSelected,
  },
  imageFrame: {
    width: AVATAR_DISPLAY_WIDTH,
    height: AVATAR_DISPLAY_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: AVATAR_DISPLAY_WIDTH,
    height: AVATAR_DISPLAY_HEIGHT,
    backgroundColor: 'transparent',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
