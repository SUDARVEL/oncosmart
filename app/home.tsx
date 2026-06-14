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
import { ExerciseVideoBanner } from '../components/ExerciseVideoBanner';
import { ProgressLogo } from '../components/home/ProgressLogo';
import { getExerciseVideoSource } from '../lib/getExerciseVideo';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

const SCREEN_WIDTH = Dimensions.get('window').width;
const QUOTE_CARD_WIDTH = SCREEN_WIDTH - 32;

const MALE_AVATAR = require('../assets/avatars/male-avatar.png');
const FEMALE_AVATAR = require('../assets/avatars/female-avatar.png');
const WALKING_CHARACTER = require('../assets/home/walking-character.png');
const EXERCISE_THUMBNAIL = require('../assets/home/exercise-thumbnail.png');

const QUOTES = ['quote1', 'quote2', 'quote3'] as const;

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const username = useAppStore((state) => state.username);
  const avatar = useAppStore((state) => state.avatar);
  const language = useAppStore((state) => state.language);
  const gender = useAppStore((state) => state.gender);
  const day1Video = getExerciseVideoSource(1, language, gender, avatar);
  const [activeQuote, setActiveQuote] = useState(0);
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
          <ProgressLogo width={79} height={80} />
          <Text style={styles.daysCompleted}>
            {t('home.daysCompleted', { completed: 0, total: 5 })}
          </Text>
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
                <Image
                  source={WALKING_CHARACTER}
                  style={styles.quoteCharacter}
                  contentFit="contain"
                />
              </View>
              <Text style={styles.quoteText}>{t(`home.${key}`)}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {QUOTES.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, activeQuote === index && styles.dotActive]}
            />
          ))}
        </View>

        <View style={styles.sessionSection}>
          <Text style={styles.sessionTitle}>{t('home.sessionTitle')}</Text>

          <View style={styles.dayCard}>
            <View style={styles.exerciseBannerWrap}>
              <ExerciseVideoBanner
                source={day1Video}
                fallbackImage={EXERCISE_THUMBNAIL}
                height={140}
              />
            </View>
            <View style={styles.dayCardBody}>
              <Text style={styles.dayLabel}>{t('home.dayLabel', { day: 1 })}</Text>
              <Text style={styles.daySubtitle}>{t('home.daySubtitle')}</Text>
              <Pressable
                style={styles.startButton}
                accessibilityRole="button"
                onPress={() => router.push(`/exercise/pain-score?day=1`)}
              >
                <Text style={styles.startButtonText}>{t('home.start')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Pressable style={styles.fab} accessibilityRole="button" accessibilityLabel="Chat">
        <Ionicons name="chatbubble" size={24} color={colors.buttonPrimary} />
      </Pressable>

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
    fontSize: 21,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
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
  daysCompleted: {
    fontSize: 20,
    ...font('semiBold'),
    color: colors.progressText,
    textAlign: 'center',
    letterSpacing: -0.23,
    lineHeight: 20,
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
    marginTop: 16,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    padding: 7,
    gap: 8,
    height: 106,
    backgroundColor: colors.background,
  },
  quoteIllustration: {
    width: 64,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  quoteCharacter: {
    width: 64,
    height: 92,
  },
  quoteText: {
    flex: 1,
    fontSize: 18,
    ...font('semiBold'),
    color: colors.textPrimary,
    lineHeight: 25,
    letterSpacing: -0.2,
  },
  sessionSection: {
    marginTop: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  sessionTitle: {
    fontSize: 20,
    ...font('medium'),
    color: colors.textPrimary,
    letterSpacing: -0.26,
    lineHeight: 28,
    paddingLeft: 13,
  },
  dayCard: {
    marginTop: 8,
    marginHorizontal: 17,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.homeCardBg,
  },
  exerciseBannerWrap: {
    marginHorizontal: 14,
    marginTop: 15,
  },
  dayCardBody: {
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: 16,
    gap: 2,
  },
  dayLabel: {
    fontSize: 16,
    ...font('medium'),
    color: colors.textPrimary,
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  daySubtitle: {
    fontSize: 14,
    ...font('regular'),
    color: colors.textMuted,
    lineHeight: 28,
    letterSpacing: -0.26,
    marginBottom: 8,
  },
  startButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: '#92A9B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 14,
    ...font('medium'),
    color: '#F9FAFB',
    letterSpacing: 0,
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    right: 9,
    bottom: 88,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.tabBarBg,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
});
