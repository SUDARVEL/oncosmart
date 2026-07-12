import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getBadgeIconSource } from '../../lib/badgeIcons';
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
};

function RemoteBadgeIcon({ badgeKey, earned }: { badgeKey: BadgeKey; earned: boolean }) {
  const source = getBadgeIconSource(badgeKey);

  if (!source) {
    return (
      <View style={[styles.badgeArt, earned ? styles.badgeArtEarned : styles.badgeArtLocked]}>
        <Image
          source={GROWTH_ASSETS.badgeBgAlt}
          style={[styles.badgeIcon, !earned && styles.badgeMuted]}
          contentFit="contain"
        />
        <Image
          source={GROWTH_ASSETS.badgeTrophy}
          style={[styles.fallbackTrophy, !earned && styles.badgeMuted]}
          contentFit="contain"
        />
        <BadgeStatusMark earned={earned} />
      </View>
    );
  }

  return (
    <View style={[styles.badgeArt, earned ? styles.badgeArtEarned : styles.badgeArtLocked]}>
      <Image
        source={source}
        style={[styles.badgeIcon, !earned && styles.badgeMuted]}
        contentFit="contain"
        recyclingKey={badgeKey}
        priority="high"
      />
      {!earned ? <View style={styles.lockedScrim} pointerEvents="none" /> : null}
      <BadgeStatusMark earned={earned} />
    </View>
  );
}

function BadgeStatusMark({ earned }: { earned: boolean }) {
  if (earned) {
    return (
      <View style={styles.earnedBadge}>
        <Image source={GROWTH_ASSETS.badgeCheck} style={styles.earnedIcon} contentFit="contain" />
      </View>
    );
  }

  return (
    <View style={styles.lockedBadge}>
      <Text style={styles.lockedBadgeText}>?</Text>
    </View>
  );
}

function BadgeCard({
  badgeKey,
  title,
  subtitle,
  earned,
}: {
  badgeKey: BadgeKey;
  title: string;
  subtitle: string;
  earned: boolean;
}) {
  return (
    <View style={[styles.badgeCard, earned && styles.badgeCardEarned]}>
      <RemoteBadgeIcon badgeKey={badgeKey} earned={earned} />
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

const BADGES: BadgeItem[] = [
  {
    key: 'startup',
    titleKey: 'growth.badgeStartupTitle',
    subtitleKey: 'growth.badgeStartupSubtitle',
  },
  {
    key: 'consistent',
    titleKey: 'growth.badgeConsistentTitle',
    subtitleKey: 'growth.badgeConsistentSubtitle',
  },
  {
    key: 'strength',
    titleKey: 'growth.badgeStrengthTitle',
    subtitleKey: 'growth.badgeStrengthSubtitle',
  },
  {
    key: 'hero',
    titleKey: 'growth.badgeHeroTitle',
    subtitleKey: 'growth.badgeHeroSubtitle',
  },
  {
    key: 'unstoppable',
    titleKey: 'growth.badgeUnstoppableTitle',
    subtitleKey: 'growth.badgeUnstoppableSubtitle',
  },
];

export function BadgesSection() {
  const { t } = useTranslation();
  const { width: screenWidth } = useWindowDimensions();
  const levelsCompleted = useAppStore((state) => state.levelsCompleted);
  const dayCompletedAt = useAppStore((state) => state.dayCompletedAt);
  const sessionsCompleted = getCompletedSessionCount(dayCompletedAt);
  const earnedBadges = getEarnedBadges(levelsCompleted, sessionsCompleted);
  const gridWidth = Math.min(322, screenWidth - 42);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('growth.allBadges')}</Text>
        <Text style={styles.sectionSubtitle}>{t('growth.badgesSubtitle')}</Text>
      </View>

      <View style={[styles.grid, { width: gridWidth }]}>
        {BADGES.map((badge) => {
          const earned = earnedBadges.has(badge.key);
          return (
            <BadgeCard
              key={badge.key}
              badgeKey={badge.key}
              title={t(badge.titleKey)}
              subtitle={t(badge.subtitleKey)}
              earned={earned}
            />
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
    borderRadius: 20,
    overflow: 'hidden',
  },
  badgeArtEarned: {
    backgroundColor: '#EFF6FF',
  },
  badgeArtLocked: {
    backgroundColor: '#E5E7EB',
  },
  badgeIcon: {
    width: 100,
    height: 100,
  },
  badgeMuted: {
    opacity: 0.4,
  },
  lockedScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(156, 163, 175, 0.28)',
  },
  fallbackTrophy: {
    position: 'absolute',
    width: 52,
    height: 60,
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
