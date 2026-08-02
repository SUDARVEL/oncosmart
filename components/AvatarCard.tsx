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
 * Larger avatar picker cards that fill more of the available height.
 * Selection = navy border + check only (no wash / no border spur artifacts).
 */
export function AvatarCard({
  imageKey,
  image,
  label,
  selected,
  onPress,
}: AvatarCardProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  // Two cards + gap 12 + screen padding 32
  const cardWidth = Math.min(180, Math.max(156, (screenWidth - 32 - 12) / 2));
  // Use more vertical space so less empty white below/above.
  const imageHeight = Math.min(440, Math.max(360, Math.round(screenHeight * 0.48)));

  return (
    <View
      style={[
        styles.card,
        { width: cardWidth },
        selected && styles.cardSelected,
      ]}
      collapsable={false}
    >
      <View
        collapsable={false}
        style={[
          styles.imageSlot,
          { width: cardWidth - 16, height: imageHeight },
        ]}
      >
        <Image
          key={imageKey}
          source={image}
          defaultSource={typeof image === 'number' ? image : undefined}
          style={{ width: cardWidth - 16, height: imageHeight }}
          resizeMode="contain"
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
    paddingTop: 12,
    paddingBottom: 14,
    paddingHorizontal: 6,
    // Always reserve border so selecting never changes layout size.
    borderWidth: 2,
    borderColor: 'transparent',
    // Clip any border/paint artifacts that used to "extend" past the card.
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.optionBorderSelected,
    backgroundColor: colors.optionBgSelected,
  },
  imageSlot: {
    borderRadius: 10,
    backgroundColor: colors.optionBg,
    overflow: 'hidden',
  },
  label: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    ...font('semiBold'),
    color: colors.textSecondary,
    includeFontPadding: true,
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
