import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

type AvatarCardProps = {
  imageKey: string;
  image: ImageSourcePropType;
  label: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * Fixed-size avatar card: figure fills the image area, label sits directly under it.
 * Avoids ScrollView flex quirks that left empty space under the label.
 */
export function AvatarCard({
  imageKey,
  image,
  label,
  selected,
  onPress,
}: AvatarCardProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const cardWidth = Math.floor((screenWidth - 32 - 12) / 2);
  // Tall enough to feel full, short enough that figure + label fill the card.
  const cardHeight = Math.min(520, Math.max(400, Math.round(screenHeight * 0.55)));
  const labelBlock = 40;
  const imageHeight = cardHeight - 12 - labelBlock - 10;

  return (
    <View
      style={[
        styles.card,
        { width: cardWidth, height: cardHeight },
        selected && styles.cardSelected,
      ]}
      collapsable={false}
    >
      <View
        collapsable={false}
        style={[styles.imageSlot, { width: cardWidth - 12, height: imageHeight }]}
      >
        <Image
          key={imageKey}
          source={image}
          defaultSource={typeof image === 'number' ? image : undefined}
          style={{ width: cardWidth - 12, height: imageHeight }}
          resizeMode="cover"
          resizeMethod="resize"
          fadeDuration={0}
        />
      </View>

      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>

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
          <Ionicons name="checkmark-circle" size={24} color={colors.buttonPrimary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: colors.optionBg,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.optionBorderSelected,
    backgroundColor: colors.optionBgSelected,
  },
  imageSlot: {
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.optionBg,
  },
  label: {
    height: 36,
    marginTop: 6,
    fontSize: 16,
    lineHeight: 28,
    ...font('semiBold'),
    color: colors.textSecondary,
    includeFontPadding: true,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  labelSelected: {
    color: colors.optionTextSelected,
  },
  hitTarget: {
    ...StyleSheet.absoluteFillObject,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
