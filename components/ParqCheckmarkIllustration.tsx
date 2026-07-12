import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

type ParqCheckmarkIllustrationProps = {
  size?: 'default' | 'large';
};

/** Congrats checkmark from Onboarding Assets / Congrats Rectangle.svg (black fringe removed). */
export function ParqCheckmarkIllustration({ size = 'default' }: ParqCheckmarkIllustrationProps) {
  const dimensions = size === 'large' ? { width: 216, height: 186 } : { width: 180, height: 155 };

  return (
    <View style={[styles.container, dimensions]}>
      <Image
        source={require('../assets/parq/checkmark.png')}
        style={styles.image}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
});
