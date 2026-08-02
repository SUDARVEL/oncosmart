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
 * Avatar picker card — image fills the card body; label stays anchored under it.
 */
export function AvatarCard({
  imageKey,
  image,
  label,
  selected,
  onPress,
}: AvatarCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(178, Math.max(158, (screenWidth - 32 - 12) / 2));

  return (
    <View
      style={[styles.card, { width: cardWidth }, selected && styles.cardSelected]}
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
    flex: 1,
    alignSelf: 'stretch',
    borderRadius: 14,
    backgroundColor: colors.optionBg,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.optionBorderSelected,
    backgroundColor: colors.optionBgSelected,
  },
  imageSlot: {
    flex: 1,
    alignSelf: 'stretch',
    width: '100%',
    borderRadius: 10,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    minHeight: 280,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 24,
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
