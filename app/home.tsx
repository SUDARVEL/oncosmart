import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabBar } from '../components/BottomTabBar';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

const SCREEN_WIDTH = Dimensions.get('window').width;
const QUOTE_CARD_WIDTH = SCREEN_WIDTH - 32;

const MALE_AVATAR = require('../assets/avatars/male-avatar.png');
const FEMALE_AVATAR = require('../assets/avatars/female-avatar.png');

const QUOTES = ['quote1', 'quote2', 'quote3'] as const;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const username = useAppStore((state) => state.username);
  const avatar = useAppStore((state) => state.avatar);
  const [activeQuote, setActiveQuote] = useState(1);
  const scrollRef = useRef<ScrollView>(null);

  const handleQuoteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / QUOTE_CARD_WIDTH);
    setActiveQuote(index);
  };

  const handleTabPress = (tab: 'home' | 'growth' | 'settings') => {
    if (tab === 'growth') router.push('/growth');
    if (tab === 'settings') router.push('/settings');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.welcome}>
            {t('home.welcome', { name: username || 'Guest' })}
          </Text>
          <View style={styles.avatarRing}>
            <Image
              source={avatar === 'female' ? FEMALE_AVATAR : MALE_AVATAR}
              style={styles.avatarImage}
              contentFit="cover"
            />
          </View>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRing}>
            <Ionicons name="walk" size={32} color={colors.line} />
          </View>
          <Text style={styles.daysCompleted}>
            {t('home.daysCompleted', { completed: 0, total: 5 })}
          </Text>
          <Text style={styles.firstStep}>{t('home.firstStep')}</Text>
        </View>

        <View style={styles.dots}>
          {QUOTES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeQuote === index && styles.dotActive]}
            />
          ))}
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleQuoteScroll}
          contentContainerStyle={styles.quoteScroll}
          decelerationRate="fast"
          snapToInterval={QUOTE_CARD_WIDTH}
        >
          {QUOTES.map((key) => (
            <View key={key} style={[styles.quoteCard, { width: QUOTE_CARD_WIDTH }]}>
              <View style={styles.quoteIllustration}>
                <Ionicons name="play-circle-outline" size={48} color={colors.textPrimary} />
              </View>
              <Text style={styles.quoteText}>{t(`home.${key}`)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.sessionSection}>
          <Text style={styles.sessionTitle}>{t('home.sessionTitle')}</Text>
          <Text style={styles.sessionSubtitle}>{t('home.sessionSubtitle')}</Text>

          <View style={styles.dayCard}>
            <View style={styles.exerciseBanner}>
              <Ionicons name="body" size={72} color="#FFFFFF" />
            </View>
            <View style={styles.dayCardFooter}>
              <View style={styles.dayTextBlock}>
                <Text style={styles.dayLabel}>{t('home.dayLabel', { day: 1 })}</Text>
                <Text style={styles.daySubtitle}>{t('home.daySubtitle')}</Text>
              </View>
              <Pressable style={styles.startButton} accessibilityRole="button">
                <Text style={styles.startButtonText}>{t('home.start')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomTabBar
        activeTab="home"
        onTabPress={handleTabPress}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  headerRow: {
    marginTop: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcome: {
    flex: 1,
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: 0.15,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.optionBorderSelected,
    overflow: 'hidden',
    backgroundColor: colors.optionBgSelected,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  progressSection: {
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  progressRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: colors.dotInactive,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysCompleted: {
    fontSize: 14,
    ...font('bold'),
    color: colors.navy,
    textAlign: 'center',
  },
  firstStep: {
    fontSize: 12,
    ...font('medium'),
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 306,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
    marginTop: 16,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.dotInactive,
  },
  dotActive: {
    width: 9,
    backgroundColor: colors.dotActive,
  },
  quoteScroll: {
    paddingHorizontal: 16,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    padding: 7,
    gap: 8,
    height: 106,
  },
  quoteIllustration: {
    width: 120,
    height: 92,
    borderRadius: 4,
    backgroundColor: colors.optionBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    ...font('bold'),
    color: colors.textPrimary,
    lineHeight: 24,
  },
  sessionSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 8,
  },
  sessionTitle: {
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: 0.15,
  },
  sessionSubtitle: {
    fontSize: 14,
    ...font('medium'),
    color: colors.textMuted,
    lineHeight: 22,
  },
  dayCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.homeCardBg,
  },
  exerciseBanner: {
    margin: 16,
    height: 112,
    borderRadius: 12,
    backgroundColor: colors.exerciseBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCardFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  dayTextBlock: {
    flex: 1,
    gap: 2,
  },
  dayLabel: {
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: 0.15,
  },
  daySubtitle: {
    fontSize: 14,
    ...font('medium'),
    color: colors.textMuted,
    lineHeight: 22,
  },
  startButton: {
    width: 120,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.buttonText,
    letterSpacing: 0.1,
  },
});
