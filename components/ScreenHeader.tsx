import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

type ScreenHeaderProps = {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  largeTitle?: boolean;
};

export function ScreenHeader({ title, showBack = false, onBack, largeTitle = false }: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      {showBack ? (
        <Pressable onPress={handleBack} style={styles.backButton} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.sideSlot} />
      )}
      {title ? (
        <Text style={[styles.title, largeTitle && styles.titleLarge]}>{title}</Text>
      ) : (
        <View style={styles.titleSpacer} />
      )}
      <View style={styles.sideSlot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideSlot: {
    width: 24,
  },
  titleSpacer: {
    flex: 1,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: 0.15,
  },
  titleLarge: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.26,
    ...font('bold'),
  },
});
