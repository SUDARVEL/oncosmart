import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '../components/ScreenHeader';
import { AdminSessionBpmTable } from '../components/admin/AdminSessionBpmTable';
import {
  fetchAdminHoldAlerts,
  markAdminHoldAlertRead,
  type AdminHoldAlert,
} from '../lib/adminHoldAlerts';
import {
  TOTAL_SESSIONS,
  buildAdminDashboardStats,
  buildAdminSessionRows,
  fetchAdminPatientProgress,
  summarizeSessionFeedback,
  type AdminPatientProgress,
} from '../lib/adminProgress';
import { formatCancerTypeForDisplay } from '../lib/cancerPathway';
import { signOut } from '../lib/auth';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';
import { uiText } from '../theme/typography';

function formatWhen(ms: number | null | undefined, locale: string): string {
  if (ms == null || !Number.isFinite(ms)) return '—';
  try {
    return new Date(ms).toLocaleString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

function formatHoldReason(
  reason: string | null | undefined,
  t: (key: string) => string,
  unknownKey: string,
  note?: string | null,
): string {
  switch (reason) {
    case 'tired':
      return t('admin.pauseReasonTired');
    case 'pain':
      return t('admin.pauseReasonPain');
    case 'treatment':
      return t('admin.pauseReasonTreatment');
    case 'unwell':
      return t('admin.pauseReasonUnwell');
    case 'exploring':
      return t('admin.quitReasonExploring');
    case 'other': {
      const label = t('admin.pauseReasonOther');
      const extra = note?.trim();
      return extra ? `${label}: ${extra}` : label;
    }
    default:
      if (typeof reason === 'string' && reason.trim()) return reason.trim();
      return t(unknownKey);
  }
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
  const chartHeight = 128;
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHead}>
        <View style={styles.chartHeadText}>
          <Text style={styles.chartTitle}>{title}</Text>
          <Text style={styles.chartHint}>{hint}</Text>
        </View>
        <Text style={styles.chartTotal}>{totalLabel}</Text>
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
  easyLabel,
  hardLabel,
  tiredLabel,
  easy,
  hard,
  tired,
}: {
  title: string;
  emptyLabel: string;
  easyLabel: string;
  hardLabel: string;
  tiredLabel: string;
  easy: number;
  hard: number;
  tired: number;
}) {
  const total = easy + hard + tired;
  const share = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHead}>
        <Text style={styles.chartTitle}>{title}</Text>
        <Text style={styles.chartTotal}>{total}</Text>
      </View>
      {total === 0 ? (
        <Text style={styles.alertsEmpty}>{emptyLabel}</Text>
      ) : (
        <>
          <View style={styles.stackTrack}>
            {easy > 0 ? (
              <View style={[styles.stackEasy, { flex: easy }]} />
            ) : null}
            {hard > 0 ? (
              <View style={[styles.stackHard, { flex: hard }]} />
            ) : null}
            {tired > 0 ? (
              <View style={[styles.stackTired, { flex: tired }]} />
            ) : null}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.stackEasy]} />
              <Text style={styles.legendLabel}>{easyLabel}</Text>
              <Text style={styles.legendValue}>
                {easy} · {share(easy)}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.stackHard]} />
              <Text style={styles.legendLabel}>{hardLabel}</Text>
              <Text style={styles.legendValue}>
                {hard} · {share(hard)}%
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.stackTired]} />
              <Text style={styles.legendLabel}>{tiredLabel}</Text>
              <Text style={styles.legendValue}>
                {tired} · {share(tired)}%
              </Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function formatTreatmentType(
  treatment: AdminPatientProgress['treatmentUndergoing'],
  t: (key: string) => string,
): string {
  switch (treatment) {
    case 'chemotherapy':
      return t('treatment.chemotherapy');
    case 'radiation':
      return t('treatment.radiation');
    case 'both':
      return t('treatment.both');
    case 'none':
      return t('treatment.none');
    default:
      return t('admin.pauseReasonNone');
  }
}

function PatientCard({
  patient,
  expanded,
  onToggle,
}: {
  patient: AdminPatientProgress;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { t, i18n } = useTranslation();
  const sessionRows = useMemo(() => buildAdminSessionRows(patient), [patient]);
  const feedbackCounts = useMemo(() => {
    const counts = { easy: 0, hard: 0, tired: 0 };
    for (const row of sessionRows) {
      if (row.sessionFeedback) counts[row.sessionFeedback] += 1;
    }
    return counts;
  }, [sessionRows]);
  const feedbackTotal = feedbackCounts.easy + feedbackCounts.hard + feedbackCounts.tired;
  const progressPct = Math.min(
    100,
    Math.round((patient.sessionsCompleted / TOTAL_SESSIONS) * 100),
  );
  const initial = (patient.displayName || patient.accountUsername || '?').trim().charAt(0).toUpperCase();
  const progressLabel = t('admin.sessionsProgress', {
    done: patient.sessionsCompleted,
    total: TOTAL_SESSIONS,
  });
  const currentLabel =
    patient.sessionsCompleted >= TOTAL_SESSIONS
      ? t('admin.programComplete')
      : t('admin.currentSession', {
          level: patient.activeLevel,
          day: patient.activeDayInLevel ?? 1,
        });

  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle} accessibilityRole="button" style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.accountId}>{patient.displayName}</Text>
          <Text style={styles.displayName}>{patient.accountUsername}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      <View style={styles.statsRow}>
        <View style={styles.progressMeta}>
          <Text style={styles.statPrimary}>{progressLabel}</Text>
          <Text style={styles.progressPct}>{progressPct}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={styles.statSecondary}>{currentLabel}</Text>
      </View>

      <View style={styles.badgeRow}>
        <View
          style={[styles.badge, patient.onboardingComplete ? styles.badgeOk : styles.badgeMuted]}
        >
          <Text style={styles.badgeText}>
            {patient.onboardingComplete ? t('admin.onboarded') : t('admin.notOnboarded')}
          </Text>
        </View>
        <View
          style={[styles.badge, patient.lastSignInAt ? styles.badgeOk : styles.badgeWarn]}
        >
          <Text style={styles.badgeText}>
            {patient.lastSignInAt ? t('admin.hasLoggedIn') : t('admin.neverLoggedIn')}
          </Text>
        </View>
        <View
          style={[styles.badge, patient.passwordChanged ? styles.badgeOk : styles.badgeMuted]}
        >
          <Text style={styles.badgeText}>
            {patient.passwordChanged ? t('admin.passwordChanged') : t('admin.defaultPassword')}
          </Text>
        </View>
        {patient.progressPaused ? (
          <View style={[styles.badge, styles.badgeWarn]}>
            <Text style={styles.badgeText}>{t('admin.paused')}</Text>
          </View>
        ) : null}
        {patient.quitReason || patient.quitAt ? (
          <View style={[styles.badge, styles.badgeDanger]}>
            <Text style={styles.badgeText}>{t('admin.quit')}</Text>
          </View>
        ) : null}
      </View>

      {patient.progressPaused ? (
        <View style={styles.pauseBanner}>
          <Text style={styles.pauseBannerTitle}>{t('admin.pauseSectionTitle')}</Text>
          <Text style={styles.pauseBannerReason}>
            {t('admin.pausedTimeLabel')}:{' '}
            {patient.pausedAt
              ? formatWhen(Date.parse(patient.pausedAt), i18n.language)
              : t('admin.pauseReasonNone')}
          </Text>
          <Text style={styles.pauseBannerReason}>
            {t('admin.reasonLabel')}:{' '}
            {formatHoldReason(patient.pauseReason, t, 'admin.pauseReasonUnknown')}
          </Text>
          {patient.pauseReasonNote ? (
            <View style={styles.noteBlock}>
              <Text style={styles.noteLabel}>{t('admin.pauseNoteLabel')}</Text>
              <Text style={styles.noteBody}>{patient.pauseReasonNote}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {patient.quitReason || patient.quitAt ? (
        <View style={styles.quitBanner}>
          <Text style={styles.quitBannerTitle}>{t('admin.quitSectionTitle')}</Text>
          <Text style={styles.quitBannerReason}>
            {t('admin.quitTimeLabel')}:{' '}
            {patient.quitAt
              ? formatWhen(Date.parse(patient.quitAt), i18n.language)
              : t('admin.pauseReasonNone')}
          </Text>
          <Text style={styles.quitBannerReason}>
            {t('admin.reasonLabel')}:{' '}
            {formatHoldReason(patient.quitReason, t, 'admin.quitReasonUnknown')}
          </Text>
        </View>
      ) : null}

      {feedbackTotal > 0 ? (
        <View style={styles.feedbackRow}>
          <Text style={styles.feedbackHeading}>{t('admin.feedbackSectionTitle')}</Text>
          <View style={styles.feedbackChips}>
            <Text style={[styles.feedbackChip, styles.feedbackEasy]}>
              {t('complete.feedbackEasy')} {feedbackCounts.easy}
            </Text>
            <Text style={[styles.feedbackChip, styles.feedbackHard]}>
              {t('complete.feedbackHard')} {feedbackCounts.hard}
            </Text>
            <Text style={[styles.feedbackChip, styles.feedbackTired]}>
              {t('complete.feedbackTired')} {feedbackCounts.tired}
            </Text>
          </View>
        </View>
      ) : null}

      {expanded ? (
        <View style={styles.detailBlock}>
          <Text style={styles.detailLine}>
            {t('admin.email')}: {patient.accountEmail}
          </Text>
          <Text style={styles.detailLine}>
            {t('admin.lastLogin')}:{' '}
            {formatWhen(
              patient.lastSignInAt ? Date.parse(patient.lastSignInAt) : null,
              i18n.language,
            )}
          </Text>
          <Text style={styles.detailLine}>
            {t('admin.passwordChangedAt')}:{' '}
            {patient.passwordChanged
              ? formatWhen(
                  patient.passwordChangedAt
                    ? Date.parse(patient.passwordChangedAt)
                    : null,
                  i18n.language,
                )
              : t('admin.defaultPassword')}
          </Text>
          {patient.age != null ? (
            <Text style={styles.detailLine}>
              {t('admin.age')}: {patient.age}
            </Text>
          ) : null}

          <Text style={styles.completedTitle}>{t('admin.cancerSectionTitle')}</Text>
          <Text style={styles.detailLine}>
            {t('admin.cancerType')}:{' '}
            {formatCancerTypeForDisplay(patient.cancerType, t)}
          </Text>
          <Text style={styles.detailLine}>
            {t('admin.treatmentUndergoing')}:{' '}
            {formatTreatmentType(patient.treatmentUndergoing, t)}
          </Text>
          <Text style={styles.detailLine}>
            {t('admin.underwentSurgery')}:{' '}
            {patient.underwentSurgery == null
              ? t('admin.pauseReasonNone')
              : patient.underwentSurgery
                ? t('treatment.yes')
                : t('treatment.no')}
          </Text>

          <Text style={styles.completedTitle}>{t('admin.pauseSectionTitle')}</Text>
          <Text style={styles.detailLine}>
            {t('admin.pausedTimeLabel')}:{' '}
            {patient.progressPaused && patient.pausedAt
              ? formatWhen(Date.parse(patient.pausedAt), i18n.language)
              : t('admin.pauseReasonNone')}
          </Text>
          <Text style={styles.detailLine}>
            {t('admin.reasonLabel')}:{' '}
            {patient.progressPaused
              ? formatHoldReason(patient.pauseReason, t, 'admin.pauseReasonNone')
              : t('admin.pauseReasonNone')}
          </Text>
          <Text style={styles.detailLine}>
            {t('admin.pauseNoteLabel')}: {patient.pauseReasonNote ?? t('admin.pauseReasonNone')}
          </Text>

          <Text style={styles.completedTitle}>{t('admin.quitSectionTitle')}</Text>
          <Text style={styles.detailLine}>
            {t('admin.quitTimeLabel')}:{' '}
            {patient.quitAt
              ? formatWhen(Date.parse(patient.quitAt), i18n.language)
              : t('admin.pauseReasonNone')}
          </Text>
          <Text style={styles.detailLine}>
            {t('admin.reasonLabel')}:{' '}
            {patient.quitReason
              ? formatHoldReason(patient.quitReason, t, 'admin.quitReasonUnknown')
              : t('admin.pauseReasonNone')}
          </Text>

          <Text style={styles.completedTitle}>{t('admin.painScoresTitle')}</Text>
          {Object.keys(patient.painScores).length === 0 ? (
            <Text style={styles.emptySessions}>{t('admin.noPainScores')}</Text>
          ) : (
            Object.entries(patient.painScores)
              .map(([key, score]) => {
                const match = /^(\d+):(\d+)$/.exec(key);
                if (!match) return null;
                return {
                  key,
                  level: Number(match[1]),
                  day: Number(match[2]),
                  score,
                };
              })
              .filter((row): row is NonNullable<typeof row> => row != null)
              .sort((a, b) => a.level - b.level || a.day - b.day)
              .map((row) => (
                <Text key={row.key} style={styles.detailLine}>
                  {t('admin.painScoreItem', {
                    level: row.level,
                    day: row.day,
                    score: row.score,
                  })}
                </Text>
              ))
          )}

          <Text style={styles.completedTitle}>{t('admin.bpmTableTitle')}</Text>
          <AdminSessionBpmTable
            rows={sessionRows}
            formatWhen={(ms) => formatWhen(ms, i18n.language)}
          />
        </View>
      ) : null}
    </View>
  );
}

export default function AdminScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const resetApp = useAppStore((state) => state.resetApp);
  const [patients, setPatients] = useState<AdminPatientProgress[]>([]);
  const [alerts, setAlerts] = useState<AdminHoldAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [patientFilter, setPatientFilter] = useState<'all' | 'active' | 'paused' | 'quit'>('all');

  const stats = useMemo(() => buildAdminDashboardStats(patients), [patients]);
  const feedback = useMemo(() => summarizeSessionFeedback(patients), [patients]);
  const unreadAlerts = useMemo(
    () => alerts.filter((alert) => !alert.readAt).slice(0, 8),
    [alerts],
  );
  const sessionsLogged = useMemo(
    () => patients.reduce((sum, patient) => sum + patient.sessionsCompleted, 0),
    [patients],
  );
  const visiblePatients = useMemo(() => {
    if (patientFilter === 'paused') return patients.filter((patient) => patient.progressPaused);
    if (patientFilter === 'quit') {
      return patients.filter((patient) => Boolean(patient.quitReason || patient.quitAt));
    }
    if (patientFilter === 'active') {
      return patients.filter(
        (patient) =>
          patient.sessionsCompleted > 0 &&
          !patient.progressPaused &&
          !patient.quitReason &&
          !patient.quitAt,
      );
    }
    return patients;
  }, [patientFilter, patients]);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    const [rows, holdAlerts] = await Promise.all([
      fetchAdminPatientProgress(),
      fetchAdminHoldAlerts(20),
    ]);
    setPatients(rows);
    setAlerts(holdAlerts);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load('initial');
    }, [load]),
  );

  const handleLogout = () => {
    const keptLanguage = useAppStore.getState().language;
    void signOut();
    resetApp();
    if (keptLanguage) useAppStore.getState().setLanguage(keptLanguage);
    router.replace('/language');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.headerBlock}>
      <ScreenHeader
        title={t('admin.title')}
        showBack
        largeTitle
        onBack={() => router.replace('/home')}
      />

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>{t('admin.dashboardHint')}</Text>
        <View style={styles.summaryActions}>
          <Pressable
            onPress={() => router.replace('/home')}
            accessibilityRole="button"
            style={styles.openAppBtn}
          >
            <Text style={styles.openAppText}>{t('admin.openExerciseApp')}</Text>
          </Pressable>
          <Pressable onPress={handleLogout} accessibilityRole="button" style={styles.logoutBtn}>
            <Text style={styles.logoutText}>{t('admin.logout')}</Text>
          </Pressable>
        </View>
      </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.buttonPrimary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load('refresh')}
              tintColor={colors.buttonPrimary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.alertsCard}>
            <Text style={styles.alertsTitle}>{t('admin.alertsTitle')}</Text>
            <Text style={styles.alertsHint}>{t('admin.alertsHint')}</Text>
            {unreadAlerts.length === 0 ? (
              <Text style={styles.alertsEmpty}>{t('admin.alertsEmpty')}</Text>
            ) : (
              unreadAlerts.map((alert) => (
                <Pressable
                  key={alert.id}
                  style={[
                    styles.alertRow,
                    alert.holdType === 'quit' ? styles.alertRowQuit : styles.alertRowPause,
                  ]}
                  onPress={() => {
                    void markAdminHoldAlertRead(alert.id);
                    setAlerts((prev) =>
                      prev.map((item) =>
                        item.id === alert.id
                          ? { ...item, readAt: new Date().toISOString() }
                          : item,
                      ),
                    );
                  }}
                >
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertBody}>{alert.body}</Text>
                </Pressable>
              ))
            )}
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>{t('admin.statTotal')}</Text>
            <Text style={styles.heroValue}>{stats.total}</Text>
            <Text style={styles.heroHint}>
              {t('admin.summary', {
                total: stats.total,
                onboarded: stats.onboarded,
                active: stats.withProgress,
              })}
            </Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stats.onboarded}</Text>
                <Text style={styles.heroStatLabel}>{t('admin.statOnboarded')}</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stats.withProgress}</Text>
                <Text style={styles.heroStatLabel}>{t('admin.statActive')}</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{stats.neverLoggedIn}</Text>
                <Text style={styles.heroStatLabel}>{t('admin.statNeverLogin')}</Text>
              </View>
            </View>
          </View>

          <View style={styles.filterRow}>
            {(
              [
                ['all', t('admin.filterAll'), stats.total],
                ['active', t('admin.filterActive'), stats.withProgress],
                ['paused', t('admin.filterPaused'), stats.paused],
                ['quit', t('admin.filterQuit'), stats.quit],
              ] as const
            ).map(([id, label, count]) => {
              const selected = patientFilter === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setPatientFilter(id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.filterChip, selected && styles.filterChipSelected]}
                >
                  <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                    {label} {count}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <SessionColumnChart
            title={t('admin.sessionsChartTitle')}
            hint={t('admin.sessionsChartHint')}
            totalLabel={t('admin.sessionsLogged', { count: sessionsLogged })}
            buckets={stats.sessionBuckets}
          />

          <FeedbackChart
            title={t('admin.feedbackSectionTitle')}
            emptyLabel={t('admin.noFeedback')}
            easyLabel={t('complete.feedbackEasy')}
            hardLabel={t('complete.feedbackHard')}
            tiredLabel={t('complete.feedbackTired')}
            easy={feedback.easy}
            hard={feedback.hard}
            tired={feedback.tired}
          />

          <Text style={styles.sectionTitle}>{t('admin.patientsTitle')}</Text>
          <Text style={styles.subtitle}>{t('admin.subtitle')}</Text>
          {visiblePatients.length === 0 ? (
            <Text style={styles.emptyList}>
              {patients.length === 0 ? t('admin.empty') : t('admin.filterEmpty')}
            </Text>
          ) : (
            visiblePatients.map((patient) => (
              <PatientCard
                key={patient.userId}
                patient={patient}
                expanded={expandedId === patient.userId}
                onToggle={() =>
                  setExpandedId((prev) => (prev === patient.userId ? null : patient.userId))
                }
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  headerBlock: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 8,
  },
  summaryBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
  },
  summaryText: {
    ...uiText(14, 'medium'),
    color: colors.textSecondary,
  },
  summaryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  openAppBtn: {
    flex: 1,
    minHeight: 40,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openAppText: {
    ...font('semiBold'),
    fontSize: 12,
    color: '#FFFFFF',
  },
  logoutBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    ...font('semiBold'),
    fontSize: 14,
    color: colors.buttonPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  sectionTitle: {
    ...uiText(18, 'semiBold'),
    color: colors.textPrimary,
    marginTop: 4,
  },
  subtitle: {
    ...uiText(14),
    color: colors.textMuted,
    marginTop: -8,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyList: {
    ...font('regular'),
    fontSize: 15,
    color: colors.textMuted,
    marginTop: 24,
    textAlign: 'center',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statChip: {
    width: '47%',
    flexGrow: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 8,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    ...uiText(28, 'semiBold'),
    color: colors.navy,
  },
  statLabel: {
    ...uiText(12, 'medium'),
    color: colors.textSecondary,
    flex: 1,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 4,
  },
  heroLabel: {
    ...uiText(14, 'medium'),
    color: colors.textMuted,
  },
  heroValue: {
    ...uiText(40, 'semiBold'),
    color: colors.navy,
  },
  heroHint: {
    ...uiText(13),
    color: colors.textSecondary,
  },
  heroStats: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F7FB',
    borderRadius: 12,
    paddingVertical: 10,
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  heroDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E5E7EB',
  },
  heroStatValue: {
    ...uiText(18, 'semiBold'),
    color: colors.navy,
  },
  heroStatLabel: {
    ...uiText(11, 'medium'),
    color: colors.textMuted,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterChipSelected: {
    backgroundColor: colors.navy,
  },
  filterChipText: {
    ...uiText(13, 'medium'),
    color: colors.textSecondary,
  },
  filterChipTextSelected: {
    ...uiText(13, 'semiBold'),
    color: '#FFFFFF',
  },
  chartCard: {
    borderRadius: 18,
    padding: 16,
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  chartHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  chartHeadText: {
    flex: 1,
    gap: 4,
  },
  chartTitle: {
    ...uiText(16, 'semiBold'),
    color: colors.textPrimary,
  },
  chartHint: {
    ...uiText(13),
    color: colors.textMuted,
  },
  chartTotal: {
    ...uiText(14, 'semiBold'),
    color: colors.navy,
  },
  columnChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
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
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    minHeight: 6,
  },
  columnLabel: {
    ...uiText(11, 'medium'),
    color: colors.textMuted,
    textAlign: 'center',
  },
  stackTrack: {
    height: 14,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#E8EEF5',
  },
  stackEasy: {
    backgroundColor: '#1F8A4C',
  },
  stackHard: {
    backgroundColor: '#E08A1E',
  },
  stackTired: {
    backgroundColor: '#C2415B',
  },
  legend: {
    gap: 8,
  },
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
  legendLabel: {
    ...uiText(13, 'medium'),
    color: colors.textPrimary,
    flex: 1,
  },
  legendValue: {
    ...uiText(13, 'semiBold'),
    color: colors.navy,
  },
  chartRows: {
    gap: 8,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartLabel: {
    width: 48,
    ...font('medium'),
    fontSize: 12,
    color: colors.textSecondary,
  },
  chartTrack: {
    flex: 1,
    height: 12,
    borderRadius: 8,
    backgroundColor: '#E8EEF5',
    overflow: 'hidden',
  },
  chartFill: {
    height: '100%',
    backgroundColor: colors.buttonPrimary,
    borderRadius: 6,
  },
  chartCount: {
    width: 28,
    textAlign: 'right',
    ...font('semiBold'),
    fontSize: 12,
    color: colors.textPrimary,
  },
  alertsCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  alertsTitle: {
    ...uiText(16, 'semiBold'),
    color: colors.textPrimary,
  },
  feedbackCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  feedbackSummary: {
    flexDirection: 'row',
    gap: 8,
  },
  feedbackStat: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 2,
  },
  feedbackStatValue: {
    ...uiText(20, 'semiBold'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  feedbackStatLabel: {
    ...uiText(11, 'medium'),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  alertsHint: {
    ...font('regular'),
    fontSize: 12,
    color: colors.textMuted,
  },
  alertsEmpty: {
    ...font('regular'),
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  alertRow: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  alertRowPause: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  alertRowQuit: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  alertTitle: {
    ...font('semiBold'),
    fontSize: 13,
    color: colors.textPrimary,
  },
  alertBody: {
    ...font('regular'),
    fontSize: 12,
    color: colors.textSecondary,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...uiText(16, 'semiBold'),
    color: colors.navy,
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  accountId: {
    ...uiText(16, 'semiBold'),
    color: colors.textPrimary,
  },
  displayName: {
    ...uiText(13),
    color: colors.textMuted,
  },
  statsRow: {
    gap: 6,
  },
  progressMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  progressPct: {
    ...uiText(13, 'semiBold'),
    color: colors.navy,
  },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: '#E8EEF5',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
  },
  statPrimary: {
    ...uiText(14, 'semiBold'),
    color: colors.textPrimary,
    flex: 1,
  },
  statSecondary: {
    ...uiText(13),
    color: colors.textSecondary,
  },
  feedbackRow: {
    gap: 8,
  },
  feedbackHeading: {
    ...uiText(13, 'semiBold'),
    color: colors.textPrimary,
  },
  feedbackChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  feedbackChip: {
    ...uiText(12, 'medium'),
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  feedbackEasy: {
    backgroundColor: '#ECFDF3',
    color: '#15803D',
  },
  feedbackHard: {
    backgroundColor: '#FFF7ED',
    color: '#C2410C',
  },
  feedbackTired: {
    backgroundColor: '#FFF1F2',
    color: '#9F1239',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeOk: {
    backgroundColor: '#E8F4FC',
  },
  badgeMuted: {
    backgroundColor: colors.optionBg,
  },
  badgeWarn: {
    backgroundColor: '#FEF3C7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    ...font('medium'),
    fontSize: 12,
    color: colors.textSecondary,
  },
  pauseBanner: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  pauseBannerTitle: {
    ...font('semiBold'),
    fontSize: 13,
    color: '#92400E',
  },
  pauseBannerReason: {
    ...uiText(13, 'medium'),
    color: '#78350F',
  },
  noteBlock: {
    marginTop: 6,
    gap: 2,
  },
  noteLabel: {
    ...uiText(12, 'semiBold'),
    color: '#92400E',
  },
  noteBody: {
    ...uiText(15, 'medium'),
    color: '#1F2937',
  },
  quitBanner: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  quitBannerTitle: {
    ...font('semiBold'),
    fontSize: 13,
    color: '#991B1B',
  },
  quitBannerReason: {
    ...font('medium'),
    fontSize: 13,
    color: '#7F1D1D',
  },
  detailBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
    gap: 4,
  },
  detailLine: {
    ...font('regular'),
    fontSize: 13,
    color: colors.textSecondary,
  },
  completedTitle: {
    marginTop: 8,
    marginBottom: 4,
    ...font('semiBold'),
    fontSize: 14,
    color: colors.textPrimary,
  },
  emptySessions: {
    ...font('regular'),
    fontSize: 13,
    color: colors.textMuted,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 3,
  },
  sessionKey: {
    ...font('medium'),
    fontSize: 13,
    color: colors.textPrimary,
  },
  sessionWhen: {
    ...font('regular'),
    fontSize: 12,
    color: colors.textMuted,
    flexShrink: 1,
    textAlign: 'right',
  },
});
