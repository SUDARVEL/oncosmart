import type { ImageSource } from 'expo-image';
import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getEarnedBadges, type BadgeKey } from '../../lib/getEarnedBadges';
import { getCompletedSessionCount } from '../../lib/programProgress';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { GROWTH_ASSETS } from './assets';

type BadgeItem = {
  key: BadgeKey;
  titleKey: string;
  subtitleKey: string;
  renderBadge: (earned: boolean) => ReactNode;
};

function BadgeArt({
  bg,
  children,
  earned,
}: {
  bg: ImageSource;
  children: ReactNode;
  earned: boolean;
}) {
  return (
    <View style={[styles.badgeArt, earned ? styles.badgeArtEarned : styles.badgeArtLocked]}>
      <Image
        source={bg}
        style={[styles.badgeBg, !earned && styles.badgeLayerMuted]}
        contentFit="contain"
      />
      <View style={!earned ? styles.badgeLayerMuted : undefined}>{children}</View>
      {!earned ? <View style={styles.lockedScrim} pointerEvents="none" /> : null}
      {earned ? (
        <View style={styles.earnedBadge}>
          <Image source={GROWTH_ASSETS.badgeCheck} style={styles.earnedIcon} contentFit="contain" />
        </View>
      ) : (
        <View style={styles.lockedBadge}>
          <Text style={styles.lockedBadgeText}>?</Text>
        </View>
      )}
    </View>
  );
}

function StartupChampionBadge({ earned }: { earned: boolean }) {
  return (
    <BadgeArt bg={GROWTH_ASSETS.badgeBg} earned={earned}>
      <Image source={GROWTH_ASSETS.badgeRocket} style={styles.rocket} contentFit="contain" />
      <Image source={GROWTH_ASSETS.badgeStars} style={styles.badgeStarsBottom} contentFit="contain" />
    </BadgeArt>
  );
}

function ConsistentStarBadge({ earned }: { earned: boolean }) {
  return (
    <BadgeArt bg={GROWTH_ASSETS.badgeBg} earned={earned}>
      <Image source={GROWTH_ASSETS.badgeCalendar} style={styles.calendarFrame} contentFit="contain" />
      <Image
        source={GROWTH_ASSETS.badgeCalendarHeader}
        style={styles.calendarHeader}
        contentFit="contain"
      />
      <Image
        source={GROWTH_ASSETS.badgeCalendarStars}
        style={styles.badgeStarsBottom}
        contentFit="contain"
      />
    </BadgeArt>
  );
}

function StrengthBuilderBadge({ earned }: { earned: boolean }) {
  return (
    <BadgeArt bg={GROWTH_ASSETS.badgeBgAlt} earned={earned}>
      <Image source={GROWTH_ASSETS.badgeMuscle} style={styles.muscle} contentFit="contain" />
      <Image source={GROWTH_ASSETS.badgeMuscleStars} style={styles.badgeStarsBottom} contentFit="contain" />
    </BadgeArt>
  );
}

function FunctionalHeroBadge({ earned }: { earned: boolean }) {
  return (
    <View style={[styles.badgeArt, earned ? styles.badgeArtEarned : styles.badgeArtLocked]}>
      <Image
        source={GROWTH_ASSETS.badgeFunctionalHero}
        style={[styles.badgeBg, !earned && styles.badgeLayerMuted]}
        contentFit="contain"
      />
      {!earned ? <View style={styles.lockedScrim} pointerEvents="none" /> : null}
      {earned ? (
        <View style={styles.earnedBadge}>
          <Image source={GROWTH_ASSETS.badgeCheck} style={styles.earnedIcon} contentFit="contain" />
        </View>
      ) : (
        <View style={styles.lockedBadge}>
          <Text style={styles.lockedBadgeText}>?</Text>
        </View>
      )}
    </View>
  );
}

function UnstoppableBadge({ earned }: { earned: boolean }) {
  return (
    <BadgeArt bg={GROWTH_ASSETS.badgeBgAlt} earned={earned}>
      <Image source={GROWTH_ASSETS.badgeTrophy} style={styles.trophy} contentFit="contain" />
      <Image source={GROWTH_ASSETS.badgeTrophyStars} style={styles.badgeStarsBottom} contentFit="contain" />
    </BadgeArt>
  );
}

function BadgeCard({
  title,
  subtitle,
  earned,
  children,
}: {
  title: string;
  subtitle: string;
  earned: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.badgeCard, earned && styles.badgeCardEarned]}>
      {children}
      <Text style={[styles.badgeTitle, earned ? styles.badgeTitleEarned : styles.badgeTitleLocked]}>
        {title}
      </Text>
      <Text
        style={[styles.badgeSubtitle, earned ? styles.badgeSubtitleEarned : styles.badgeSubtitleLocked]}
      >
        {subtitle}
      </Text>
      <Text style={[styles.statusLabel, earned ? styles.statusEarned : styles.statusLocked]}>
        {earned ? 'Earned' : 'Locked'}
      </Text>
    </View>
  );
}

export function BadgesSection() {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const levelsCompleted = useAppStore((state) => state.levelsCompleted);
  const dayCompletedAt = useAppStore((state) => state.dayCompletedAt);
  const sessionsCompleted = getCompletedSessionCount(dayCompletedAt);
  const earnedBadges = getEarnedBadges(levelsCompleted, sessionsCompleted);
  const gridWidth = Math.min(322, screenWidth - 42);

  const badges: BadgeItem[] = [
    {
      key: 'startup',
      titleKey: 'growth.badgeStartupTitle',
      subtitleKey: 'growth.badgeStartupSubtitle',
      renderBadge: (earned) => <StartupChampionBadge earned={earned} />,
    },
    {
      key: 'consistent',
      titleKey: 'growth.badgeConsistentTitle',
      subtitleKey: 'growth.badgeConsistentSubtitle',
      renderBadge: (earned) => <ConsistentStarBadge earned={earned} />,
    },
    {
      key: 'strength',
      titleKey: 'growth.badgeStrengthTitle',
      subtitleKey: 'growth.badgeStrengthSubtitle',
      renderBadge: (earned) => <StrengthBuilderBadge earned={earned} />,
    },
    {
      key: 'hero',
      titleKey: 'growth.badgeHeroTitle',
      subtitleKey: 'growth.badgeHeroSubtitle',
      renderBadge: (earned) => <FunctionalHeroBadge earned={earned} />,
    },
    {
      key: 'unstoppable',
      titleKey: 'growth.badgeUnstoppableTitle',
      subtitleKey: 'growth.badgeUnstoppableSubtitle',
      renderBadge: (earned) => <UnstoppableBadge earned={earned} />,
    },
  ];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('growth.allBadges')}</Text>
        <Text style={styles.sectionSubtitle}>{t('growth.badgesSubtitle')}</Text>
      </View>

      <View style={[styles.grid, { width: gridWidth }]}>
        {badges.map((badge) => {
          const earned = earnedBadges.has(badge.key);
          return (
            <BadgeCard
              key={badge.key}
              title={t(badge.titleKey)}
              subtitle={t(badge.subtitleKey)}
              earned={earned}
            >
              {badge.renderBadge(earned)}
            </BadgeCard>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 6,
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontSize: 20,
    ...font('semiBold'),
    color: '#00131F',
    letterSpacing: 0.5,
    lineHeight: 28,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    ...font('medium'),
    color: '#4B5563',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  badgeCard: {
    width: 148,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeCardEarned: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BFDBFE',
  },
  badgeArt: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    overflow: 'hidden',
  },
  badgeArtEarned: {
    backgroundColor: '#EFF6FF',
  },
  badgeArtLocked: {
    backgroundColor: '#E5E7EB',
  },
  badgeLayerMuted: {
    opacity: 0.35,
  },
  lockedScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(156, 163, 175, 0.35)',
  },
  badgeBg: {
    width: 100,
    height: 100,
    position: 'absolute',
  },
  rocket: {
    width: 50,
    height: 58,
    marginTop: 8,
  },
  calendarFrame: {
    width: 65,
    height: 52,
    marginTop: 10,
  },
  calendarHeader: {
    position: 'absolute',
    width: 46,
    height: 28,
    top: 24,
  },
  muscle: {
    width: 69,
    height: 60,
    marginTop: 8,
  },
  trophy: {
    width: 53,
    height: 62,
    marginTop: 4,
  },
  badgeStarsBottom: {
    position: 'absolute',
    bottom: 12,
    width: 48,
    height: 12,
  },
  earnedBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#9CA3AF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    ...font('semiBold'),
  },
  earnedIcon: {
    width: 16,
    height: 16,
  },
  badgeTitle: {
    fontSize: 14,
    ...font('semiBold'),
    lineHeight: 18,
    textAlign: 'center',
  },
  badgeTitleEarned: {
    color: colors.textPrimary,
  },
  badgeTitleLocked: {
    color: '#9CA3AF',
  },
  badgeSubtitle: {
    fontSize: 11,
    ...font('regular'),
    lineHeight: 14,
    textAlign: 'center',
    minHeight: 28,
  },
  badgeSubtitleEarned: {
    color: '#6B7280',
  },
  badgeSubtitleLocked: {
    color: '#9CA3AF',
  },
  statusLabel: {
    fontSize: 11,
    ...font('medium'),
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  statusEarned: {
    color: '#2563EB',
  },
  statusLocked: {
    color: '#9CA3AF',
  },
});
