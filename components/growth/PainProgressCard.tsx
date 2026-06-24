import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { CHART_BAR_HEIGHTS, GROWTH_ASSETS } from './assets';

const X_LABELS = ['Mon', 'Wed', 'Fri', 'Sun'] as const;
const Y_LABELS = ['8', '4', '0'] as const;

type PainProgressCardProps = {
  score: number;
  paused?: boolean;
  hasProgress?: boolean;
};

export function PainProgressCard({ score, paused = false, hasProgress = false }: PainProgressCardProps) {
  const { t } = useTranslation();
  const bars = paused ? GROWTH_ASSETS.barsPaused : GROWTH_ASSETS.barsActive;
  const showBars = hasProgress;

  return (
    <View style={[styles.card, paused && styles.cardPaused]}>
      <Text style={styles.title}>{t('growth.yourProgress')}</Text>

      <View style={styles.content}>
        <View style={styles.scoreBlock}>
          <Text style={styles.scoreLabel}>{t('growth.painScore')}</Text>
          <Text style={[styles.scoreValue, paused && styles.scoreValuePaused]}>
            {t('growth.painScoreValue', { score })}
          </Text>
        </View>

        <View style={styles.chart}>
          <View style={styles.yAxis}>
            {Y_LABELS.map((label) => (
              <View key={label} style={styles.yTickRow}>
                <Text style={styles.yLabel}>{label}</Text>
                <Image
                  source={GROWTH_ASSETS.chartYLabelLine}
                  style={styles.yTickLine}
                  contentFit="fill"
                />
              </View>
            ))}
          </View>

          <View style={styles.chartBody}>
            <View style={styles.gridLayer}>
              <Image source={GROWTH_ASSETS.chartGrid} style={styles.gridImage} contentFit="fill" />
            </View>

            <View style={styles.barsRow}>
              {showBars
                ? bars.map((bar, index) => (
                    <Image
                      key={index}
                      source={bar}
                      style={[styles.bar, { height: CHART_BAR_HEIGHTS[index] }]}
                      contentFit="fill"
                    />
                  ))
                : null}
            </View>

            <Image source={GROWTH_ASSETS.chartBaseline} style={styles.baseline} contentFit="fill" />

            <View style={styles.xLabelsRow}>
              {X_LABELS.map((label) => (
                <View key={label} style={styles.xLabelWrap}>
                  <Image source={GROWTH_ASSETS.chartTick} style={styles.xTick} contentFit="fill" />
                  <Text style={styles.xLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.footer}>{t('growth.lowerIsBetter')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 350,
    minHeight: 239,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    alignItems: 'center',
  },
  cardPaused: {
    opacity: 0.28,
  },
  title: {
    alignSelf: 'stretch',
    fontSize: 16,
    ...font('semiBold'),
    color: colors.textPrimary,
    letterSpacing: -0.26,
    lineHeight: 28,
  },
  content: {
    width: 317,
    gap: 16,
  },
  scoreBlock: {
    gap: 8,
  },
  scoreLabel: {
    fontSize: 14,
    ...font('medium'),
    color: '#4B5563',
  },
  scoreValue: {
    fontSize: 20,
    ...font('semiBold'),
    color: '#2563EB',
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  scoreValuePaused: {
    color: colors.textPlaceholder,
  },
  chart: {
    flexDirection: 'row',
    gap: 4,
  },
  yAxis: {
    width: 22,
    justifyContent: 'space-between',
    paddingBottom: 24,
    paddingTop: 4,
  },
  yTickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  yLabel: {
    width: 16,
    fontSize: 10,
    ...font('regular'),
    color: colors.textPlaceholder,
    textAlign: 'right',
  },
  yTickLine: {
    width: 14,
    height: 1,
  },
  chartBody: {
    flex: 1,
    height: 80,
    justifyContent: 'flex-end',
  },
  gridLayer: {
    ...StyleSheet.absoluteFillObject,
    bottom: 20,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingLeft: 4,
    height: 63,
    marginBottom: 2,
  },
  bar: {
    width: 29,
  },
  baseline: {
    width: '100%',
    height: 1,
    marginBottom: 4,
  },
  xLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  xLabelWrap: {
    alignItems: 'center',
    minWidth: 40,
  },
  xTick: {
    width: 1,
    height: 6,
    marginBottom: 2,
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
