import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
import { openWhatsAppSupport } from '../lib/openWhatsAppSupport';
import { HOME_PAGE_PLACEHOLDER_VIDEO } from '../lib/placeholderVideo';
import { HOME_DAY_CARD_PREVIEW_ASPECT } from '../lib/exerciseVideoFrame';
import {
  DAYS_PER_LEVEL,
  formatCountdown,
  getActiveLevel,
  getCompletedSessionCount,
  getSessionState,
  sessionKey,
  TOTAL_SESSIONS,
  type SessionState,
} from '../lib/programProgress';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

const SCREEN_WIDTH = Dimensions.get('window').width;
const QUOTE_CARD_WIDTH = SCREEN_WIDTH - 32;

const MALE_AVATAR = require('../assets/avatars/male-avatar.png');
const FEMALE_AVATAR = require('../assets/avatars/female-avatar.png');
const WALKING_CHARACTER = require('../assets/home/walking-character.png');
const DAY_CARD_PREVIEW_ASPECT = HOME_DAY_CARD_PREVIEW_ASPECT;

const QUOTES = ['quote1', 'quote2', 'quote3'] as const;

function getPrimarySessionState(states: SessionState[]): SessionState {
  const available = states.find((state) => state.status === 'available');
  if (available) return available;

  const countdownLocked = states.find(
    (state) => state.status === 'locked' && !state.blockedByLevel && !state.blockedByPrevious,
  );
  if (countdownLocked) return countdownLocked;

  const levelLocked = states.find((state) => state.status === 'locked');
  if (levelLocked) return levelLocked;

  return states[states.length - 1];
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const username = useAppStore((state) => state.username);
  const avatar = useAppStore((state) => state.avatar);
  const dayCompletedAt = useAppStore((state) => state.dayCompletedAt);
  const devUnlockOverride = useAppStore((state) => state.devUnlockOverride);

  const [activeQuote, setActiveQuote] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const scrollRef = useRef<ScrollView>(null);

  const completedCount = getCompletedSessionCount(dayCompletedAt);
  const activeLevel = getActiveLevel(dayCompletedAt);
  const sessionStates = Array.from({ length: DAYS_PER_LEVEL }, (_, index) =>
    getSessionState(activeLevel, index + 1, dayCompletedAt, now, devUnlockOverride),
  );
  const primarySession = getPrimarySessionState(sessionStates);
  const hasActiveCountdown = sessionStates.some(
    (state) => state.status === 'locked' && state.remainingMs > 0,
  );

  useEffect(() => {
    if (!hasActiveCountdown) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [hasActiveCountdown]);

  const handleQuoteScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / QUOTE_CARD_WIDTH);
    setActiveQuote(index);
  };

  const handleTabPress = (tab: 'home' | 'growth' | 'settings') => {
    if (tab === 'growth') router.push('/growth');
    if (tab === 'settings') router.push('/settings');
  };

  const handleAvatarPress = () => {
    router.push('/onboarding/avatar?from=home');
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
          <Pressable
            onPress={handleAvatarPress}
            style={styles.avatarRing}
            accessibilityRole="button"
            accessibilityLabel={t('home.changeAvatar')}
          >
            <Image
              source={avatar === 'female' ? FEMALE_AVATAR : MALE_AVATAR}
              style={styles.avatarImage}
              contentFit="cover"
            />
          </Pressable>
        </View>

        <View style={styles.progressSection}>
          <ProgressLogo width={79} height={80} />
          <Text style={styles.daysCompleted}>
            {t('home.daysCompleted', { completed: completedCount, total: TOTAL_SESSIONS })}
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

          <DayCard
            key={`${primarySession.level}-${primarySession.dayInLevel}`}
            sessionState={primarySession}
            onStart={() =>
              router.push(
                `/exercise/pain-score?level=${primarySession.level}&day=${primarySession.dayInLevel}`,
              )
            }
          />
        </View>

        {__DEV__ ? <DevPanel /> : null}
      </ScrollView>

      <Pressable
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Chat"
        onPress={openWhatsAppSupport}
      >
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

function DayCard({
  sessionState,
  onStart,
}: {
  sessionState: SessionState;
  onStart: () => void;
}) {
  const { t } = useTranslation();
  const { status, remainingMs, blockedByPrevious, blockedByLevel, dayInLevel, level } =
    sessionState;
  const isLocked = status === 'locked';

  return (
    <View style={[styles.dayCard, isLocked && styles.dayCardLocked]}>
      <View style={styles.exerciseBannerWrap}>
        <ExerciseVideoBanner
          source={HOME_PAGE_PLACEHOLDER_VIDEO}
          aspectRatio={DAY_CARD_PREVIEW_ASPECT}
          previewContentFit="contain"
          fillContainer
        />
        {isLocked ? (
          <View style={styles.lockOverlay} pointerEvents="none">
            <Ionicons name="lock-closed" size={28} color="#FFFFFF" />
          </View>
        ) : null}
      </View>
      <View style={styles.dayCardBody}>
        <Text style={styles.dayLabel}>{t('home.dayLabel', { day: dayInLevel })}</Text>
        <Text style={styles.daySubtitle}>{t('home.daySubtitle')}</Text>

        {status === 'completed' ? (
          <View style={styles.completedButton}>
            <Ionicons name="checkmark" size={16} color="#16A34A" />
            <Text style={styles.completedButtonText}>{t('home.completed')}</Text>
          </View>
        ) : status === 'available' ? (
          <Pressable style={styles.startButton} accessibilityRole="button" onPress={onStart}>
            <Text style={styles.startButtonText}>{t('home.start')}</Text>
          </Pressable>
        ) : (
          <View style={styles.lockedButton}>
            <Ionicons name="lock-closed" size={15} color={colors.textMuted} />
            <Text style={styles.lockedButtonText}>
              {blockedByLevel
                ? t('home.finishLevelToUnlock', { level: level - 1 })
                : blockedByPrevious
                  ? t('home.finishPrevToUnlock', { day: dayInLevel - 1 })
                  : t('home.unlocksIn', { time: formatCountdown(remainingMs) })}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function DevPanel() {
  const markSessionCompleted = useAppStore((state) => state.markSessionCompleted);
  const setDevUnlockOverride = useAppStore((state) => state.setDevUnlockOverride);
  const devResetProgress = useAppStore((state) => state.devResetProgress);
  const devUnlockOverride = useAppStore((state) => state.devUnlockOverride);
  const dayCompletedAt = useAppStore((state) => state.dayCompletedAt);
  const activeLevel = getActiveLevel(useAppStore.getState().dayCompletedAt);

  const nextDayToSkip = (() => {
    for (let day = 1; day <= DAYS_PER_LEVEL; day += 1) {
      if (!dayCompletedAt[sessionKey(activeLevel, day)]) return day;
    }
    return null;
  })();

  return (
    <View style={styles.devPanel}>
      <Text style={styles.devTitle}>DEV TOOLS</Text>
      <View style={styles.devRow}>
        <Pressable
          style={styles.devButton}
          accessibilityRole="button"
          onPress={() =>
            markSessionCompleted(activeLevel, 1, Date.now() - 25 * 60 * 60 * 1000)
          }
        >
          <Text style={styles.devButtonText}>Complete L{activeLevel}D1 (-25h)</Text>
        </Pressable>
        <Pressable
          style={styles.devButton}
          accessibilityRole="button"
          onPress={() => markSessionCompleted(activeLevel, 1)}
        >
          <Text style={styles.devButtonText}>Complete L{activeLevel}D1 (now)</Text>
        </Pressable>
      </View>
      <View style={styles.devRow}>
        <Pressable
          style={styles.devButton}
          accessibilityRole="button"
          disabled={!nextDayToSkip}
          onPress={() => {
            if (!nextDayToSkip) return;
            // Complete the next incomplete day with (-25h) so the following day unlocks immediately.
            markSessionCompleted(
              activeLevel,
              nextDayToSkip,
              Date.now() - 25 * 60 * 60 * 1000,
            );
          }}
        >
          <Text style={styles.devButtonText}>
            Skip next day (-25h)
          </Text>
        </Pressable>
      </View>
      <View style={styles.devRow}>
        <Pressable
          style={styles.devButton}
          accessibilityRole="button"
          onPress={() => {
            for (let day = 1; day <= DAYS_PER_LEVEL; day += 1) {
              markSessionCompleted(
                activeLevel,
                day,
                Date.now() - (DAYS_PER_LEVEL - day) * 25 * 60 * 60 * 1000,
              );
            }
          }}
        >
          <Text style={styles.devButtonText}>Complete all L{activeLevel}</Text>
        </Pressable>
        <Pressable
          style={[styles.devButton, devUnlockOverride && styles.devButtonActive]}
          accessibilityRole="button"
          onPress={() => setDevUnlockOverride(!devUnlockOverride)}
        >
          <Text style={styles.devButtonText}>
            Bypass 24h: {devUnlockOverride ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
      </View>
      <Pressable style={styles.devButton} accessibilityRole="button" onPress={devResetProgress}>
        <Text style={styles.devButtonText}>Reset progress</Text>
      </Pressable>
    </View>
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
  },
  sessionTitle: {
    fontSize: 20,
    ...font('medium'),
    color: colors.textPrimary,
    letterSpacing: -0.26,
    lineHeight: 28,
    paddingLeft: 13,
    marginBottom: 8,
  },
  dayCard: {
    marginHorizontal: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    backgroundColor: colors.homeCardBg,
    paddingBottom: 16,
  },
  dayCardLocked: {
    opacity: 0.92,
  },
  exerciseBannerWrap: {
    marginHorizontal: 14,
    marginTop: 15,
    position: 'relative',
    alignSelf: 'stretch',
    aspectRatio: DAY_CARD_PREVIEW_ASPECT,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    borderRadius: 8,
  },
  dayCardBody: {
    paddingHorizontal: 15,
    paddingTop: 12,
    gap: 2,
  },
  dayLabel: {
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: -0.26,
    lineHeight: 22,
    textTransform: 'uppercase',
  },
  daySubtitle: {
    fontSize: 14,
    ...font('regular'),
    color: colors.textMuted,
    lineHeight: 20,
    letterSpacing: -0.26,
    marginBottom: 12,
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
  completedButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    borderWidth: 1,
    borderColor: '#16A34A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  completedButtonText: {
    fontSize: 14,
    ...font('medium'),
    color: '#16A34A',
  },
  lockedButton: {
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  lockedButtonText: {
    fontSize: 14,
    ...font('medium'),
    color: colors.textMuted,
  },
  devPanel: {
    marginTop: 20,
    marginHorizontal: 17,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C084FC',
    backgroundColor: 'rgba(192, 132, 252, 0.06)',
    gap: 8,
  },
  devTitle: {
    fontSize: 11,
    ...font('semiBold'),
    color: '#7C3AED',
    letterSpacing: 1,
  },
  devRow: {
    flexDirection: 'row',
    gap: 8,
  },
  devButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  devButtonActive: {
    backgroundColor: '#C4B5FD',
  },
  devButtonText: {
    fontSize: 11,
    ...font('medium'),
    color: '#5B21B6',
    textAlign: 'center',
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
