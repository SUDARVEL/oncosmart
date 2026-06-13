import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

export default function GrowthScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('home.tabGrowth')}</Text>
        <Text style={styles.subtitle}>Coming soon</Text>
      </View>

      <BottomTabBar
        activeTab="growth"
        onTabPress={(tab) => {
          if (tab === 'home') router.replace('/home');
          if (tab === 'settings') router.replace('/settings');
        }}
        labels={{
          home: t('home.tabHome'),
          growth: t('home.tabGrowth'),
          settings: t('home.tabSettings'),
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    ...font('bold'),
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    ...font('regular'),
    color: colors.textSecondary,
  },
});
