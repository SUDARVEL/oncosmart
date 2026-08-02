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

/** Fixed picker card size — never depends on selection state. */
export const AVATAR_PICKER_CARD_WIDTH = 156;
export const AVATAR_PICKER_IMAGE_HEIGHT = 360;

type AvatarCardProps = {
  /** Stable native key so Android never recycles this Image into the sibling. */
  imageKey: string;
  image: ImageSourcePropType;
  label: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * Avatar picker card engineered against Android blank/swap bugs:
 * - Image lives in a fixed-size slot that never changes on selection
 * - Selection is an absolute overlay ring (no borderWidth layout shift)
 * - Opaque JPEG sources + resizeMethod="resize" keep both bitmaps alive
 */
export function AvatarCard({
  imageKey,
  image,
  label,
  selected,
  onPress,
}: AvatarCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
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

      {/* Overlay only — never mutates the Image slot size/border */}
      <View
        pointerEvents="none"
        style={[styles.selectionOverlay, selected && styles.selectionOverlayOn]}
        collapsable={false}
      >
        {selected ? (
          <View style={styles.checkBadge}>
            <Ionicons name="checkmark-circle" size={22} color={colors.buttonPrimary} />
          </View>
        ) : null}
      </View>
    </Pressable>
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
    overflow: 'visible',
  },
  imageSlot: {
    width: AVATAR_PICKER_CARD_WIDTH - 12,
    height: AVATAR_PICKER_IMAGE_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#EEF2F6',
    overflow: 'hidden',
  },
  image: {
    width: AVATAR_PICKER_CARD_WIDTH - 12,
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
  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  selectionOverlayOn: {
    borderColor: colors.optionBorderSelected,
    backgroundColor: 'rgba(232, 244, 252, 0.22)',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
