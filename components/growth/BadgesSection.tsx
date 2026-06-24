import type { ImageSource } from 'expo-image';
import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { getEarnedBadges, type BadgeKey } from '../../lib/getEarnedBadges';
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
    <View style={[styles.badgeArt, !earned && styles.badgeArtLocked]}>
      <Image source={bg} style={styles.badgeBg} contentFit="contain" />
      {children}
      {earned ? (
        <View style={styles.earnedBadge}>
          <Image source={GROWTH_ASSETS.badgeCheck} style={styles.earnedIcon} contentFit="contain" />
        </View>
      ) : null}
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
    <View style={[styles.badgeArt, !earned && styles.badgeArtLocked]}>
      <Image source={GROWTH_ASSETS.badgeFunctionalHero} style={styles.badgeBg} contentFit="contain" />
      {earned ? (
        <View style={styles.earnedBadge}>
          <Image source={GROWTH_ASSETS.badgeCheck} style={styles.earnedIcon} contentFit="contain" />
        </View>
      ) : null}
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
    <View style={styles.badgeCard}>
      {children}
      <Text style={[styles.badgeTitle, !earned && styles.badgeTitleLocked]}>{title}</Text>
      <Text style={[styles.badgeSubtitle, !earned && styles.badgeSubtitleLocked]}>{subtitle}</Text>
    </View>
  );
}

export function BadgesSection() {
  const { t } = useTranslation();
  const levelsCompleted = useAppStore((state) => state.levelsCompleted);
  const earnedBadges = getEarnedBadges(levelsCompleted);

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

  const rows = [badges.slice(0, 2), badges.slice(2, 4), badges.slice(4)];

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{t('growth.allBadges')}</Text>
        <Text style={styles.sectionSubtitle}>{t('growth.badgesSubtitle')}</Text>
      </View>

      <View style={styles.grid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((badge) => {
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
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    width: '100%',
    paddingHorizontal: 21,
    gap: 16,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontSize: 20,
    ...font('semiBold'),
    color: '#00131F',
    letterSpacing: 0.5,
    lineHeight: 16,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    ...font('medium'),
    color: '#4B5563',
    textAlign: 'center',
  },
  grid: {
    width: 322,
    gap: 40,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'center',
    width: '100%',
  },
  badgeCard: {
    width: 149,
    alignItems: 'center',
    gap: 8,
  },
  badgeArt: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeArtLocked: {
    opacity: 0.28,
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
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  earnedIcon: {
    width: 18,
    height: 18,
  },
  badgeTitle: {
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
  badgeTitleLocked: {
    color: '#9CA3AF',
  },
  badgeSubtitle: {
    fontSize: 10,
    ...font('regular'),
    color: '#858E93',
    textAlign: 'center',
  },
  badgeSubtitleLocked: {
    color: '#9CA3AF',
  },
});
