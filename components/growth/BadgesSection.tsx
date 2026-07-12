import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SvgUri } from 'react-native-svg';

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
  const uri = source && typeof source === 'object' && 'uri' in source ? source.uri : null;

  if (!uri) {
    return (
      <View style={styles.badgeArt}>
        <View style={!earned ? styles.badgeMuted : undefined}>
          <Image source={GROWTH_ASSETS.badgeTrophy} style={styles.fallbackTrophy} contentFit="contain" />
        </View>
        {earned ? (
          <View style={styles.earnedBadge}>
            <Image source={GROWTH_ASSETS.badgeCheck} style={styles.earnedIcon} contentFit="contain" />
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.badgeArt}>
      <View style={!earned ? styles.badgeMuted : undefined}>
        <SvgUri uri={uri} width={100} height={100} />
      </View>
      {earned ? (
        <View style={styles.earnedBadge}>
          <Image source={GROWTH_ASSETS.badgeCheck} style={styles.earnedIcon} contentFit="contain" />
        </View>
      ) : null}
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
    <View style={styles.badgeCard}>
      <RemoteBadgeIcon badgeKey={badgeKey} earned={earned} />
      <Text style={[styles.badgeTitle, !earned && styles.badgeTitleLocked]}>{title}</Text>
      <Text style={[styles.badgeSubtitle, !earned && styles.badgeSubtitleLocked]}>{subtitle}</Text>
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
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  badgeArt: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  badgeMuted: {
    opacity: 0.38,
  },
  fallbackTrophy: {
    width: 72,
    height: 80,
  },
  earnedBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#6B7280',
  },
  badgeSubtitleLocked: {
    color: '#9CA3AF',
  },
});
