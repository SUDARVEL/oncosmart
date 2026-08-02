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
  image: ImageSourcePropType;
  label: string;
  selected: boolean;
  onPress: () => void;
};

/**
 * Stable avatar picker card.
 * - Image never remounts on selection (only border/check change)
 * - Fixed pixel size (not %/flex) so Android can't shrink/blank a side
 * - collapsable={false} keeps the native Image view alive
 */
export function AvatarCard({ image, label, selected, onPress }: AvatarCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.max(140, Math.min(180, (screenWidth - 16 * 2 - 12) / 2));
  const imageHeight = Math.round(cardWidth * 2.35);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { width: cardWidth },
        selected && styles.cardSelected,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <View
        collapsable={false}
        style={[styles.imageFrame, { width: cardWidth - 12, height: imageHeight }]}
      >
        <Image
          source={image}
          defaultSource={typeof image === 'number' ? image : undefined}
          style={{ width: cardWidth - 12, height: imageHeight }}
          resizeMode="contain"
          fadeDuration={0}
        />
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      {selected ? (
        <View style={styles.checkBadge} pointerEvents="none">
          <Ionicons name="checkmark-circle" size={22} color={colors.buttonPrimary} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: colors.optionBg,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 6,
  },
  cardSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 2,
    borderColor: colors.optionBorderSelected,
  },
  imageFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2F6',
    borderRadius: 8,
    overflow: 'hidden',
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
