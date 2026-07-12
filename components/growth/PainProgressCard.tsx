import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { GROWTH_ASSETS } from './assets';

const X_LABELS = ['Mon', 'Wed', 'Fri', 'Sun'] as const;
const Y_LABELS = ['8', '4', '0'] as const;

/** Slightly taller bars than the Figma base set for a clearer chart. */
const BAR_HEIGHTS = [80, 70, 60, 60, 50, 40, 40] as const;

type PainProgressCardProps = {
  /** 7 bars representing Day 1..Day 7 of the active level. Use null when missing. */
  scoresByDay: Array<number | null>;
  /** Used when there's no pain score for the active level yet. */
  fallbackScore?: number;
  paused?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scoreToBarHeight(score: number): number {
  const normalized = clamp(score, 0, 10) / 10;
  const idx = Math.round(normalized * (BAR_HEIGHTS.length - 1));
  return BAR_HEIGHTS[idx];
}

export function PainProgressCard({
  scoresByDay,
  fallbackScore = 4,
  paused = false,
}: PainProgressCardProps) {
  const { t } = useTranslation();
  const bars = paused ? GROWTH_ASSETS.barsPaused : GROWTH_ASSETS.barsActive;
  const currentScore =
    [...scoresByDay].reverse().find((v): v is number => typeof v === 'number') ?? fallbackScore;

  return (
    <View style={[styles.card, paused && styles.cardPaused]}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{t('growth.yourProgress')}</Text>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>{t('growth.painScore')}</Text>
          <Text style={[styles.scoreValue, paused && styles.scoreValuePaused]}>
            {t('growth.painScoreValue', { score: currentScore })}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.chart}>
          <View style={styles.yAxis}>
            {Y_LABELS.map((label) => (
              <View key={label} style={styles.yTickRow}>
                <Text style={[styles.yLabel, paused && styles.axisLabelPaused]}>{label}</Text>
                <View style={[styles.yTickLine, paused && styles.yTickLinePaused]} />
              </View>
            ))}
          </View>

          <View style={styles.chartBody}>
            <View style={styles.gridLines}>
              <View style={[styles.gridLine, paused && styles.gridLinePaused]} />
              <View style={[styles.gridLine, paused && styles.gridLinePaused]} />
              <View style={[styles.gridLine, paused && styles.gridLinePaused]} />
            </View>

            <View style={styles.barsRow}>
              {bars.map((bar, index) => {
                const score = scoresByDay[index];
                const height = score == null ? 0 : scoreToBarHeight(score);
                return (
                  <Image
                    key={index}
                    source={bar}
                    style={[styles.bar, { height }]}
                    contentFit="fill"
                  />
                );
              })}
            </View>

            <View style={[styles.baseline, paused && styles.baselinePaused]} />

            <View style={styles.xLabelsRow}>
              {X_LABELS.map((label) => (
                <View key={label} style={styles.xLabelWrap}>
                  <View style={[styles.xTick, paused && styles.xTickPaused]} />
                  <Text style={[styles.xLabel, paused && styles.axisLabelPaused]}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={[styles.footer, paused && styles.axisLabelPaused]}>
          {t('growth.lowerIsBetter')}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 350,
    minHeight: 260,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  cardPaused: {
    opacity: 0.28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  scoreBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  scoreLabel: {
    fontSize: 14,
    ...font('medium'),
    color: '#4B5563',
    textAlign: 'right',
  },
  scoreValue: {
    fontSize: 22,
    ...font('semiBold'),
    color: colors.buttonPrimary,
    letterSpacing: 0.5,
    lineHeight: 28,
    textAlign: 'right',
  },
  scoreValuePaused: {
    color: '#9CA3AF',
  },
  content: {
    width: '100%',
    gap: 12,
  },
  chart: {
    flexDirection: 'row',
    gap: 6,
    minHeight: 120,
  },
  yAxis: {
    width: 24,
    justifyContent: 'space-between',
    paddingBottom: 28,
    paddingTop: 2,
  },
  yTickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yLabel: {
    width: 16,
    fontSize: 11,
    ...font('regular'),
    color: colors.textPlaceholder,
    textAlign: 'right',
  },
  axisLabelPaused: {
    color: '#9CA3AF',
  },
  yTickLine: {
    width: 4,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  yTickLinePaused: {
    backgroundColor: '#E5E7EB',
  },
  chartBody: {
    flex: 1,
    height: 118,
    justifyContent: 'flex-end',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
    bottom: 28,
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  gridLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  gridLinePaused: {
    backgroundColor: '#F3F4F6',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 80,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  bar: {
    width: 32,
    borderRadius: 2,
  },
  baseline: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#9CA3AF',
    marginBottom: 6,
  },
  baselinePaused: {
    backgroundColor: '#D1D5DB',
  },
  xLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  xLabelWrap: {
    alignItems: 'center',
    minWidth: 44,
  },
  xTick: {
    width: 1,
    height: 6,
    backgroundColor: '#D1D5DB',
    marginBottom: 2,
  },
  xTickPaused: {
    backgroundColor: '#E5E7EB',
  },
  xLabel: {
    fontSize: 11,
    ...font('regular'),
    color: colors.textPlaceholder,
    textAlign: 'center',
  },
  footer: {
    fontSize: 12,
    ...font('regular'),
    color: colors.textPlaceholder,
    textAlign: 'center',
  },
});
