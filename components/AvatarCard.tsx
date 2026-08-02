import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

/** Fixed picker card size — identical in every selection state. */
export const AVATAR_PICKER_CARD_WIDTH = 156;
export const AVATAR_PICKER_IMAGE_HEIGHT = 340;

type AvatarCardProps = {
  imageKey: string;
  image: ImageSourcePropType;
  label: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * Figma avatar option states:
 * - none / selected: image always fully visible at the same size
 * - selected: navy border + check badge only (no wash, no shrink, no hide)
 */
export function AvatarCard({
  imageKey,
  image,
  label,
  selected,
  onPress,
}: AvatarCardProps) {
  return (
    <View
      style={[styles.card, selected && styles.cardSelected]}
      collapsable={false}
    >
      {/* Image is NEVER gated on selection — always mounted, fixed size. */}
      <View style={styles.imageSlot} collapsable={false}>
        <Image
          key={imageKey}
          source={image}
          defaultSource={typeof image === 'number' ? image : undefined}
          style={styles.image}
          resizeMode="contain"
          resizeMethod="resize"
          fadeDuration={0}
        />
      </View>

      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>

      {/* Full-card tap target — does not wrap the Image in opacity styles. */}
      <Pressable
        onPress={onPress}
        style={styles.hitTarget}
        android_ripple={{ color: 'transparent' }}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
      />

      {selected ? (
        <View style={styles.checkBadge} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={22} color={colors.buttonPrimary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: AVATAR_PICKER_CARD_WIDTH,
    borderRadius: 12,
    backgroundColor: colors.optionBg,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 6,
    // Border width reserved always — selecting only changes color.
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.optionBorderSelected,
  },
  imageSlot: {
    width: AVATAR_PICKER_CARD_WIDTH - 16,
    height: AVATAR_PICKER_IMAGE_HEIGHT,
    borderRadius: 8,
    backgroundColor: colors.optionBg,
    overflow: 'hidden',
  },
  image: {
    width: AVATAR_PICKER_CARD_WIDTH - 16,
    height: AVATAR_PICKER_IMAGE_HEIGHT,
  },
  label: {
    marginTop: 10,
    fontSize: 15,
    ...font('semiBold'),
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.optionTextSelected,
  },
  hitTarget: {
    ...StyleSheet.absoluteFillObject,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
