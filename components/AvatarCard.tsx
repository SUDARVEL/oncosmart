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
 * Fixed-size avatar card: full figure (including hands) fills the card height.
 * Picker assets include side padding so cover does not crop arms.
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
  const cardHeight = Math.min(520, Math.max(400, Math.round(screenHeight * 0.55)));

  return (
    <View
      style={[
        styles.card,
        { width: cardWidth, height: cardHeight },
        selected && styles.cardSelected,
      ]}
      collapsable={false}
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

      <View style={styles.labelBar} pointerEvents="none">
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      </View>

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
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.optionBorderSelected,
    backgroundColor: colors.optionBgSelected,
  },
  imageSlot: {
    ...StyleSheet.absoluteFillObject,
    bottom: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.optionBg,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  labelBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 42,
    paddingHorizontal: 8,
    backgroundColor: colors.optionBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    ...font('semiBold'),
    color: colors.textSecondary,
    includeFontPadding: true,
    textAlign: 'center',
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
