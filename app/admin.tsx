import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
  TOTAL_SESSIONS,
  fetchAdminPatientProgress,
  sortedCompletedSessions,
  type AdminPatientProgress,
} from '../lib/adminProgress';
import { signOut } from '../lib/auth';
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
          style={[
            styles.badge,
            patient.onboardingComplete ? styles.badgeOk : styles.badgeMuted,
          ]}
        >
          <Text style={styles.badgeText}>
            {patient.onboardingComplete ? t('admin.onboarded') : t('admin.notOnboarded')}
          </Text>
        </View>
        {patient.progressPaused ? (
          <View style={[styles.badge, styles.badgeWarn]}>
            <Text style={styles.badgeText}>{t('admin.paused')}</Text>
          </View>
        ) : null}
        <View style={[styles.badge, styles.badgeMuted]}>
          <Text style={styles.badgeText}>
            {t('admin.levelsDone', { count: patient.levelsCompleted })}
          </Text>
        </View>
      </View>

      {expanded ? (
        <View style={styles.detailBlock}>
          <Text style={styles.detailLine}>
            {t('admin.email')}: {patient.accountEmail}
          </Text>
          {patient.age != null ? (
            <Text style={styles.detailLine}>
              {t('admin.age')}: {patient.age}
            </Text>
          ) : null}
          {patient.cancerType ? (
            <Text style={styles.detailLine}>
              {t('admin.cancerType')}: {patient.cancerType}
            </Text>
          ) : null}
          <Text style={styles.detailLine}>
            {t('admin.lastUpdated')}:{' '}
            {formatWhen(
              patient.updatedAt ? Date.parse(patient.updatedAt) : null,
              i18n.language,
            )}
          </Text>

          <Text style={styles.completedTitle}>{t('admin.completedSessions')}</Text>
          {completed.length === 0 ? (
            <Text style={styles.emptySessions}>{t('admin.noSessionsYet')}</Text>
          ) : (
            completed.map((session) => (
              <View key={session.key} style={styles.sessionRow}>
                <Text style={styles.sessionKey}>
                  {t('admin.sessionItem', {
                    level: session.level,
                    day: session.dayInLevel,
                  })}
                </Text>
                <Text style={styles.sessionWhen}>
                  {formatWhen(session.completedAt, i18n.language)}
                </Text>
              </View>
            ))
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);
    setError(null);
    const rows = await fetchAdminPatientProgress();
    setPatients(rows);
    if (rows.length === 0) {
      // Empty can mean no data yet, or RPC/auth failed — show a soft hint either way.
      setError(null);
    }
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

  const withProgress = patients.filter((p) => p.sessionsCompleted > 0).length;
  const onboarded = patients.filter((p) => p.onboardingComplete).length;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('admin.title')} />

      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {t('admin.summary', {
            total: patients.length,
            onboarded,
            active: withProgress,
          })}
        </Text>
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
          <Text style={styles.subtitle}>{t('admin.subtitle')}</Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
    marginBottom: 4,
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
  errorText: {
    ...font('regular'),
    fontSize: 14,
    color: '#B42318',
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
  badgeText: {
    ...font('medium'),
    fontSize: 12,
    color: colors.textSecondary,
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
