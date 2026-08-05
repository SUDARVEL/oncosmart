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
import {
  fetchAdminHoldAlerts,
  markAdminHoldAlertRead,
  presentAdminHoldLocalNotification,
  type AdminHoldAlert,
} from '../lib/adminHoldAlerts';
import {
  TOTAL_SESSIONS,
  buildAdminDashboardStats,
  fetchAdminPatientProgress,
  sortedCompletedSessions,
  type AdminPatientProgress,
} from '../lib/adminProgress';
import { getCurrentSession, signOut } from '../lib/auth';
import { registerAdminPushTokenDetailed } from '../lib/pushTokens';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { font } from '../theme/fonts';

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
    default:
      if (typeof reason === 'string' && reason.trim()) return reason.trim();
      return t(unknownKey);
  }
}

function StatChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SessionBarChart({
  buckets,
}: {
  buckets: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>Sessions completed</Text>
      <View style={styles.chartRows}>
        {buckets.map((bucket) => (
          <View key={bucket.label} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{bucket.label}</Text>
            <View style={styles.chartTrack}>
              <View
                style={[
                  styles.chartFill,
                  { width: `${Math.round((bucket.count / max) * 100)}%` },
                ]}
              />
            </View>
            <Text style={styles.chartCount}>{bucket.count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
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
  const completed = sortedCompletedSessions(patient.dayCompletedAt);
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
        <View style={styles.cardHeaderText}>
          <Text style={styles.accountId}>{patient.accountUsername}</Text>
          <Text style={styles.displayName}>{patient.displayName}</Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textMuted}
        />
      </Pressable>

      <View style={styles.statsRow}>
        <Text style={styles.statPrimary}>{progressLabel}</Text>
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
        {patient.progressPaused && patient.progressHoldType === 'pause' ? (
          <View style={[styles.badge, styles.badgeWarn]}>
            <Text style={styles.badgeText}>{t('admin.paused')}</Text>
          </View>
        ) : null}
        {patient.progressPaused && patient.progressHoldType === 'quit' ? (
          <View style={[styles.badge, styles.badgeDanger]}>
            <Text style={styles.badgeText}>{t('admin.quit')}</Text>
          </View>
        ) : null}
      </View>

      {patient.progressPaused && patient.progressHoldType === 'pause' ? (
        <View style={styles.pauseBanner}>
          <Text style={styles.pauseBannerTitle}>{t('admin.pausedTitle')}</Text>
          <Text style={styles.pauseBannerReason}>
            {t('admin.pauseReason')}:{' '}
            {formatHoldReason(patient.pauseReason, t, 'admin.pauseReasonUnknown')}
          </Text>
          {patient.pausedAt ? (
            <Text style={styles.pauseBannerReason}>
              {t('admin.pausedAt')}: {formatWhen(Date.parse(patient.pausedAt), i18n.language)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {patient.progressPaused && patient.progressHoldType === 'quit' ? (
        <View style={styles.quitBanner}>
          <Text style={styles.quitBannerTitle}>{t('admin.quitTitle')}</Text>
          <Text style={styles.quitBannerReason}>
            {t('admin.quitReason')}:{' '}
            {formatHoldReason(patient.quitReason, t, 'admin.quitReasonUnknown')}
          </Text>
          {patient.quitAt ? (
            <Text style={styles.quitBannerReason}>
              {t('admin.quitAt')}: {formatWhen(Date.parse(patient.quitAt), i18n.language)}
            </Text>
          ) : null}
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

          <Text style={styles.completedTitle}>{t('admin.holdStatusTitle')}</Text>
          <Text style={styles.detailLine}>
            {t('admin.pauseStatus')}:{' '}
            {patient.progressPaused
              ? patient.progressHoldType === 'quit'
                ? t('admin.quit')
                : t('admin.paused')
              : t('admin.notPaused')}
          </Text>
          {patient.progressHoldType === 'pause' ? (
            <Text style={styles.detailLine}>
              {t('admin.pauseReason')}:{' '}
              {formatHoldReason(patient.pauseReason, t, 'admin.pauseReasonUnknown')}
            </Text>
          ) : null}
          {patient.progressHoldType === 'quit' ? (
            <Text style={styles.detailLine}>
              {t('admin.quitReason')}:{' '}
              {formatHoldReason(patient.quitReason, t, 'admin.quitReasonUnknown')}
            </Text>
          ) : null}

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

          <Text style={styles.completedTitle}>{t('admin.completedSessions')}</Text>
          {completed.length === 0 ? (
            <Text style={styles.emptySessions}>{t('admin.noSessionsYet')}</Text>
          ) : (
            completed.map((session) => {
              const painKey = `${session.level}:${session.dayInLevel}`;
              const pain = patient.painScores[painKey];
              return (
                <View key={session.key} style={styles.sessionRow}>
                  <Text style={styles.sessionKey}>
                    {t('admin.sessionItem', {
                      level: session.level,
                      day: session.dayInLevel,
                    })}
                    {typeof pain === 'number' ? ` · ${pain}/10` : ''}
                  </Text>
                  <Text style={styles.sessionWhen}>
                    {formatWhen(session.completedAt, i18n.language)}
                  </Text>
                </View>
              );
            })
          )}
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
  const [pushStatus, setPushStatus] = useState<string>('');

  const stats = useMemo(() => buildAdminDashboardStats(patients), [patients]);
  const unreadAlerts = useMemo(
    () => alerts.filter((alert) => !alert.readAt).slice(0, 8),
    [alerts],
  );

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

  const registerAlertsQuietly = useCallback(async () => {
    const session = await getCurrentSession();
    const userId = session?.user?.id;
    if (!userId) return;
    const result = await registerAdminPushTokenDetailed(userId);
    if (result.status === 'saved') {
      setPushStatus(t('admin.alertsEnabled'));
      return;
    }
    if (result.status === 'no_permission') {
      setPushStatus(t('admin.alertsPermissionDenied'));
      return;
    }
    // Remote Expo token may be unavailable without FCM — local/realtime alerts still work.
    setPushStatus(t('admin.alertsLocalOnly'));
  }, [t]);

  const enableAlerts = useCallback(async () => {
    const session = await getCurrentSession();
    const userId = session?.user?.id;
    if (!userId) {
      setPushStatus(t('admin.alertsError'));
      return;
    }
    const result = await registerAdminPushTokenDetailed(userId);
    if (result.status === 'saved') {
      setPushStatus(t('admin.alertsEnabled'));
    } else if (result.status === 'no_permission') {
      setPushStatus(t('admin.alertsPermissionDenied'));
      return;
    } else {
      setPushStatus(t('admin.alertsLocalOnly'));
    }
    // Always fire a local test so the admin can confirm notifications appear.
    await presentAdminHoldLocalNotification({
      title: t('admin.testAlertTitle'),
      body: t('admin.testAlertBody'),
    });
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load('initial');
      void registerAlertsQuietly();
    }, [load, registerAlertsQuietly]),
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
      <ScreenHeader title={t('admin.title')} />

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>{t('admin.dashboardHint')}</Text>
        <Pressable onPress={handleLogout} accessibilityRole="button" style={styles.logoutBtn}>
          <Text style={styles.logoutText}>{t('admin.logout')}</Text>
        </Pressable>
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
            {pushStatus ? <Text style={styles.alertsStatus}>{pushStatus}</Text> : null}
            <Pressable
              onPress={() => void enableAlerts()}
              accessibilityRole="button"
              style={styles.enableAlertsBtn}
            >
              <Text style={styles.enableAlertsText}>{t('admin.enableAlerts')}</Text>
            </Pressable>
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

          <View style={styles.statGrid}>
            <StatChip label={t('admin.statTotal')} value={stats.total} />
            <StatChip label={t('admin.statOnboarded')} value={stats.onboarded} />
            <StatChip label={t('admin.statActive')} value={stats.withProgress} />
            <StatChip label={t('admin.statNeverLogin')} value={stats.neverLoggedIn} />
            <StatChip label={t('admin.statPasswordChanged')} value={stats.passwordChanged} />
            <StatChip label={t('admin.statPaused')} value={stats.paused} />
            <StatChip label={t('admin.statQuit')} value={stats.quit} />
          </View>

          <SessionBarChart buckets={stats.sessionBuckets} />

          <Text style={styles.subtitle}>{t('admin.subtitle')}</Text>
          {patients.length === 0 ? (
            <Text style={styles.emptyList}>{t('admin.empty')}</Text>
          ) : (
            patients.map((patient) => (
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
    backgroundColor: colors.background,
  },
  summaryBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryText: {
    flex: 1,
    ...font('medium'),
    fontSize: 13,
    color: colors.textSecondary,
  },
  logoutBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
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
    gap: 12,
  },
  subtitle: {
    ...font('regular'),
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
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
    gap: 8,
  },
  statChip: {
    width: '31%',
    minWidth: 100,
    flexGrow: 1,
    backgroundColor: colors.optionBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  statValue: {
    ...font('bold'),
    fontSize: 20,
    color: colors.navy,
  },
  statLabel: {
    ...font('regular'),
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  chartCard: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    backgroundColor: colors.homeCardBg,
  },
  chartTitle: {
    ...font('semiBold'),
    fontSize: 15,
    color: colors.textPrimary,
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
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.optionBg,
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
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.homeCardBg,
    gap: 8,
  },
  alertsTitle: {
    ...font('semiBold'),
    fontSize: 15,
    color: colors.textPrimary,
  },
  alertsHint: {
    ...font('regular'),
    fontSize: 12,
    color: colors.textMuted,
  },
  alertsStatus: {
    ...font('medium'),
    fontSize: 12,
    color: colors.buttonPrimary,
  },
  enableAlertsBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  enableAlertsText: {
    ...font('semiBold'),
    fontSize: 13,
    color: '#FFFFFF',
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
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.homeCardBg,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  accountId: {
    ...font('bold'),
    fontSize: 17,
    color: colors.navy,
  },
  displayName: {
    ...font('regular'),
    fontSize: 13,
    color: colors.textMuted,
  },
  statsRow: {
    gap: 2,
  },
  statPrimary: {
    ...font('semiBold'),
    fontSize: 15,
    color: colors.textPrimary,
  },
  statSecondary: {
    ...font('regular'),
    fontSize: 13,
    color: colors.textSecondary,
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
    ...font('medium'),
    fontSize: 13,
    color: '#78350F',
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
