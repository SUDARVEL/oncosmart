import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export function SplashFooter() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/splash/college-footer.png')}
        style={styles.footerImage}
        contentFit="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 56,
    paddingBottom: 46,
  },
  footerImage: {
    width: 278,
    height: 56,
  },
});
