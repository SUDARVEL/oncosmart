import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { AdminDashboardStats, SessionFeedbackCounts } from '../../lib/adminProgress';
import { formatCancerTypeForDisplay } from '../../lib/cancerPathway';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

type Props = {
  stats: AdminDashboardStats;
  feedback: SessionFeedbackCounts;
};

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <View style={styles.kpiCard}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {hint ? <Text style={styles.kpiHint}>{hint}</Text> : null}
    </View>
  );
}

function ShareBars({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; label: string; count: number; color: string }[];
}) {
  const total = Math.max(1, rows.reduce((sum, row) => sum + row.count, 0));
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>{title}</Text>
      {rows.map((row) => {
        const pct = Math.round((row.count / total) * 100);
        return (
          <View key={row.key} style={styles.barRow}>
            <View style={styles.barMeta}>
              <Text style={styles.barLabel}>{row.label}</Text>
              <Text style={styles.barValue}>
                {row.count} · {pct}%
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${Math.max(row.count === 0 ? 0 : 4, pct)}%`, backgroundColor: row.color },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function SessionColumnChart({
  title,
  hint,
  totalLabel,
  buckets,
}: {
  title: string;
  hint: string;
  totalLabel: string;
  buckets: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const chartHeight = 120;
  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <View style={styles.panelHeadText}>
          <Text style={styles.panelTitle}>{title}</Text>
          <Text style={styles.panelHint}>{hint}</Text>
        </View>
        <Text style={styles.panelTotal}>{totalLabel}</Text>
      </View>
      <View style={styles.columnChart}>
        {buckets.map((bucket) => {
          const height =
            bucket.count === 0 ? 0 : Math.max(8, Math.round((bucket.count / max) * chartHeight));
          return (
            <View key={bucket.label} style={styles.column}>
              <Text style={styles.columnCount}>{bucket.count}</Text>
              <View style={[styles.columnTrack, { height: chartHeight }]}>
                <View style={[styles.columnBar, { height }]} />
              </View>
              <Text style={styles.columnLabel}>{bucket.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FeedbackChart({
  title,
  emptyLabel,
  feedback,
}: {
  title: string;
  emptyLabel: string;
  feedback: SessionFeedbackCounts;
}) {
  const { t } = useTranslation();
  const total = feedback.easy + feedback.hard + feedback.tired + feedback.other;
  const share = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));
  const rows = [
    { key: 'easy', label: t('complete.feedbackEasy'), count: feedback.easy, color: '#16A34A' },
    { key: 'hard', label: t('complete.feedbackHard'), count: feedback.hard, color: '#DC2626' },
    { key: 'tired', label: t('complete.feedbackTired'), count: feedback.tired, color: '#D97706' },
    { key: 'other', label: t('complete.feedbackOther'), count: feedback.other, color: colors.buttonPrimary },
  ].filter((row) => row.count > 0 || total === 0);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHead}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Text style={styles.panelTotal}>{total}</Text>
      </View>
      {total === 0 ? (
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        <>
          <View style={styles.stackTrack}>
            {feedback.easy > 0 ? <View style={[styles.stackEasy, { flex: feedback.easy }]} /> : null}
            {feedback.hard > 0 ? <View style={[styles.stackHard, { flex: feedback.hard }]} /> : null}
            {feedback.tired > 0 ? (
              <View style={[styles.stackTired, { flex: feedback.tired }]} />
            ) : null}
            {feedback.other > 0 ? (
              <View style={[styles.stackOther, { flex: feedback.other }]} />
            ) : null}
          </View>
          {rows.map((row) => (
            <View key={row.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: row.color }]} />
              <Text style={styles.barLabel}>{row.label}</Text>
              <Text style={styles.barValue}>
                {row.count} · {share(row.count)}%
              </Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
}

/** KPI strip + status/cancer bars + session and feedback charts for the admin home. */
export function AdminDashboardInsights({ stats, feedback }: Props) {
  const { t } = useTranslation();

  const statusRows = stats.statusBuckets.map((bucket) => ({
    key: bucket.id,
    label:
      bucket.id === 'active'
        ? t('admin.filterActive')
        : bucket.id === 'paused'
          ? t('admin.filterPaused')
          : bucket.id === 'quit'
            ? t('admin.filterQuit')
            : t('admin.statusIdle'),
    count: bucket.count,
    color:
      bucket.id === 'active'
        ? '#16A34A'
        : bucket.id === 'paused'
          ? '#D97706'
          : bucket.id === 'quit'
            ? '#DC2626'
            : colors.textPlaceholder,
  }));

  const cancerRows = stats.cancerBuckets.map((bucket, index) => ({
    key: bucket.slug,
    label:
      bucket.slug === 'unknown'
        ? t('admin.pauseReasonNone')
        : formatCancerTypeForDisplay(bucket.slug, t),
    count: bucket.count,
    color: ['#005F99', '#2E6C96', '#16A34A', '#D97706', '#7C3AED'][index % 5]!,
  }));

  return (
    <View style={styles.wrap}>
      <View style={styles.kpiGrid}>
        <KpiCard label={t('admin.statTotal')} value={stats.total} hint={t('admin.statOnboarded') + `: ${stats.onboarded}`} />
        <KpiCard
          label={t('admin.filterActive')}
          value={stats.statusBuckets.find((b) => b.id === 'active')?.count ?? 0}
          hint={t('admin.avgSessions', { count: stats.avgSessions })}
        />
        <KpiCard label={t('admin.filterPaused')} value={stats.paused} />
        <KpiCard
          label={t('admin.completionRate')}
          value={`${stats.completionRate}%`}
          hint={t('admin.sessionsLogged', { count: stats.sessionsLogged })}
        />
      </View>

      <ShareBars title={t('admin.statusBreakdownTitle')} rows={statusRows} />
      <ShareBars title={t('admin.cancerBreakdownTitle')} rows={cancerRows} />

      <SessionColumnChart
        title={t('admin.sessionsChartTitle')}
        hint={t('admin.sessionsChartHint')}
        totalLabel={t('admin.sessionsLogged', { count: stats.sessionsLogged })}
        buckets={stats.sessionBuckets}
      />

      <FeedbackChart
        title={t('admin.feedbackSectionTitle')}
        emptyLabel={t('admin.noFeedback')}
        feedback={feedback}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 4,
  },
  kpiLabel: {
    ...uiText(12, 'medium'),
    color: colors.textMuted,
  },
  kpiValue: {
    ...uiText(28, 'bold'),
    color: colors.navy,
  },
  kpiHint: {
    ...uiText(12, 'regular'),
    color: colors.textSecondary,
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 10,
  },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  panelHeadText: {
    flex: 1,
    gap: 2,
  },
  panelTitle: {
    ...uiText(15, 'semiBold'),
    color: '#1E1E1E',
  },
  panelHint: {
    ...uiText(12, 'regular'),
    color: colors.textMuted,
  },
  panelTotal: {
    ...uiText(14, 'semiBold'),
    color: colors.buttonPrimary,
  },
  barRow: {
    gap: 6,
  },
  barMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  barLabel: {
    ...uiText(13, 'medium'),
    color: '#374151',
    flex: 1,
  },
  barValue: {
    ...uiText(12, 'semiBold'),
    color: colors.textMuted,
  },
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  columnChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 4,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  columnCount: {
    ...uiText(12, 'semiBold'),
    color: colors.navy,
  },
  columnTrack: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  columnBar: {
    width: '70%',
    maxWidth: 36,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  columnLabel: {
    ...uiText(11, 'medium'),
    color: colors.textMuted,
  },
  stackTrack: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#EEF2F7',
  },
  stackEasy: { backgroundColor: '#16A34A' },
  stackHard: { backgroundColor: '#DC2626' },
  stackTired: { backgroundColor: '#D97706' },
  stackOther: { backgroundColor: colors.buttonPrimary },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  empty: {
    ...uiText(13, 'regular'),
    color: colors.textMuted,
  },
});
