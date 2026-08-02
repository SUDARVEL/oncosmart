import { Ionicons } from '@expo/vector-icons';
import { Image, type ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

type AvatarCardProps = {
  /** Bundled PNG for this card only — never shared across male/female. */
  image: ImageSourcePropType;
  imageKey: 'male' | 'female';
  label: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * Avatar picker card.
 * Uses RN Image (not expo-image) so Android never recycles male/female bitmaps
 * into the wrong card when selection changes.
 */
export function AvatarCard({ image, imageKey, label, selected, onPress }: AvatarCardProps) {
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
          // Force a dedicated native view per gender; never reuse the other card's bitmap.
          key={`avatar-static-${imageKey}`}
          source={image}
          defaultSource={typeof image === 'number' ? image : undefined}
          style={styles.image}
          resizeMode="contain"
          fadeDuration={0}
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
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 6,
    minHeight: 420,
  },
  cardSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 2,
    borderColor: colors.optionBorderSelected,
  },
  imageFrame: {
    width: '100%',
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F6',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
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
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});
