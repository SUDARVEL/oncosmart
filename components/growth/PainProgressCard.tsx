import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

const DEFAULT_X_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const Y_LABELS = ['8', '4', '0'] as const;

/** Chart plot height for a max pain score of 10. */
const MAX_BAR_HEIGHT = 80;
const MIN_BAR_HEIGHT = 8;

type PainProgressCardProps = {
  /**
   * 7 bars for Mon–Sun of the current local week.
   * Use null when no pain score was recorded that calendar day.
   */
  scoresByDay: Array<number | null>;
  /** Used when there's no pain score for the week yet. */
  fallbackScore?: number;
  /** Optional Mon–Sun labels (defaults to English short names). */
  weekdayLabels?: string[];
  paused?: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Map 0–10 pain → visible bar height (0 still shows a tiny stub). */
function scoreToBarHeight(score: number): number {
  const normalized = clamp(score, 0, 10) / 10;
  return Math.round(MIN_BAR_HEIGHT + normalized * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT));
}

export function PainProgressCard({
  scoresByDay,
  fallbackScore = 4,
  weekdayLabels,
  paused = false,
}: PainProgressCardProps) {
  const { t } = useTranslation();
  const xLabels = weekdayLabels?.length === 7 ? weekdayLabels : [...DEFAULT_X_LABELS];
  const currentScore =
    [...scoresByDay].reverse().find((v): v is number => typeof v === 'number') ?? fallbackScore;

  const activeColor = paused ? '#9CA3AF' : colors.buttonPrimary;
  const gradientColors = paused
    ? (['rgba(156, 163, 175, 0.25)', '#9CA3AF'] as const)
    : (['rgba(15, 128, 202, 0.25)', colors.buttonPrimary] as const);

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
              {Array.from({ length: 7 }, (_, index) => {
                const score = scoresByDay[index];
                if (score == null || !Number.isFinite(score)) {
                  return <View key={index} style={styles.barSlot} />;
                }
                const height = scoreToBarHeight(score);
                return (
                  <View key={index} style={styles.barSlot}>
                    <LinearGradient
                      colors={[...gradientColors]}
                      start={{ x: 0.5, y: 0 }}
                      end={{ x: 0.5, y: 1 }}
                      style={[styles.bar, { height, backgroundColor: activeColor }]}
                    />
                  </View>
                );
              })}
            </View>

            <View style={[styles.baseline, paused && styles.baselinePaused]} />

            <View style={styles.xLabelsRow}>
              {xLabels.map((label, index) => (
                <View key={`${label}-${index}`} style={styles.xLabelWrap}>
                  <View style={[styles.xTick, paused && styles.xTickPaused]} />
                  <Text style={[styles.xLabel, paused && styles.axisLabelPaused]} numberOfLines={1}>
                    {label}
                  </Text>
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
    height: MAX_BAR_HEIGHT,
    marginBottom: 4,
    paddingHorizontal: 2,
  },
  barSlot: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: MAX_BAR_HEIGHT,
  },
  bar: {
    width: 18,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: MIN_BAR_HEIGHT,
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
    paddingHorizontal: 0,
  },
  xLabelWrap: {
    alignItems: 'center',
    width: 36,
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
    fontSize: 10,
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
