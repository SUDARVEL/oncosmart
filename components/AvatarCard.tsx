import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { type ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

type AvatarCardProps = {
  image: ImageSourcePropType;
  /** Stable id so male/female never share a recycled native image slot. */
  imageKey: 'male' | 'female';
  label: string;
  selected: boolean;
  onPress: () => void;
  /** Optional fallback if the primary full-body asset fails to decode. */
  fallbackImage?: ImageSourcePropType;
};

/**
 * Avatar picker card — fixed size (no flex crush), unique recyclingKey,
 * and a text label so selection stays clear even if media is slow.
 */
export function AvatarCard({
  image,
  imageKey,
  label,
  selected,
  onPress,
  fallbackImage,
}: AvatarCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <View style={styles.imageFrame}>
        <Image
          source={image}
          placeholder={fallbackImage}
          recyclingKey={`oncosmart-avatar-${imageKey}`}
          style={styles.image}
          contentFit="contain"
          contentPosition="center"
          cachePolicy="memory-disk"
          transition={0}
          allowDownscaling
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {selected ? (
        <View style={styles.checkBadge}>
          <Ionicons name="checkmark-circle" size={22} color={colors.buttonPrimary} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: colors.optionBg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 8,
    minHeight: 340,
  },
  cardSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 2,
    borderColor: colors.optionBorderSelected,
  },
  imageFrame: {
    width: '100%',
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    ...font('semiBold'),
    color: colors.textSecondary,
  },
  labelSelected: {
    color: colors.optionTextSelected,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
