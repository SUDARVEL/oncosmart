import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  TOTAL_SESSIONS,
  getAdminPatientStatus,
  type AdminPatientProgress,
} from '../../lib/adminProgress';
import { formatCancerTypeForDisplay } from '../../lib/cancerPathway';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

type Props = {
  patients: AdminPatientProgress[];
  expandedId: string | null;
  onToggle: (userId: string) => void;
  renderExpanded: (patient: AdminPatientProgress) => ReactNode;
};

function statusStyle(status: ReturnType<typeof getAdminPatientStatus>) {
  switch (status) {
    case 'active':
      return { bg: '#E8F8EE', text: '#15803D', labelKey: 'admin.filterActive' as const };
    case 'paused':
      return { bg: '#FFF7E8', text: '#B45309', labelKey: 'admin.filterPaused' as const };
    case 'quit':
      return { bg: '#FEECEC', text: '#B91C1C', labelKey: 'admin.filterQuit' as const };
    default:
      return { bg: '#F3F4F6', text: '#6B7280', labelKey: 'admin.statusIdle' as const };
  }
}

function formatShortDate(iso: string | null, locale: string): string {
  if (!iso) return '—';
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return '—';
  try {
    return new Date(ms).toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return '—';
  }
}

/** Dense patient table inspired by admin member lists; expands into the detail card. */
export function AdminPatientTable({ patients, expandedId, onToggle, renderExpanded }: Props) {
  const { t, i18n } = useTranslation();

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.colPatient]}>{t('admin.tablePatient')}</Text>
            <Text style={[styles.headerCell, styles.colStatus]}>{t('admin.tableStatus')}</Text>
            <Text style={[styles.headerCell, styles.colProgress]}>{t('admin.tableProgress')}</Text>
            <Text style={[styles.headerCell, styles.colLevel]}>{t('admin.tableLevel')}</Text>
            <Text style={[styles.headerCell, styles.colCancer]}>{t('admin.tableCancer')}</Text>
            <Text style={[styles.headerCell, styles.colSignIn]}>{t('admin.tableLastSignIn')}</Text>
          </View>

          {patients.map((patient) => {
            const status = getAdminPatientStatus(patient);
            const tone = statusStyle(status);
            const expanded = expandedId === patient.userId;
            const pct = Math.min(
              100,
              Math.round((patient.sessionsCompleted / TOTAL_SESSIONS) * 100),
            );
            return (
              <View key={patient.userId}>
                <Pressable
                  onPress={() => onToggle(patient.userId)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  style={[styles.dataRow, expanded && styles.dataRowExpanded]}
                >
                  <View style={[styles.cell, styles.colPatient]}>
                    <Text style={styles.primaryText} numberOfLines={1}>
                      {patient.displayName}
                    </Text>
                    <Text style={styles.secondaryText} numberOfLines={1}>
                      {patient.accountUsername || patient.accountEmail || '—'}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.colStatus]}>
                    <View style={[styles.statusPill, { backgroundColor: tone.bg }]}>
                      <Text style={[styles.statusText, { color: tone.text }]}>
                        {t(tone.labelKey)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.cell, styles.colProgress]}>
                    <Text style={styles.primaryText}>
                      {patient.sessionsCompleted}/{TOTAL_SESSIONS}
                    </Text>
                    <View style={styles.miniTrack}>
                      <View style={[styles.miniFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                  <View style={[styles.cell, styles.colLevel]}>
                    <Text style={styles.primaryText}>
                      {patient.sessionsCompleted >= TOTAL_SESSIONS
                        ? t('admin.programComplete')
                        : `L${patient.activeLevel} · D${patient.activeDayInLevel ?? 1}`}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.colCancer]}>
                    <Text style={styles.primaryText} numberOfLines={2}>
                      {formatCancerTypeForDisplay(patient.cancerType, t)}
                    </Text>
                  </View>
                  <View style={[styles.cell, styles.colSignIn, styles.signInCell]}>
                    <Text style={styles.secondaryText}>
                      {formatShortDate(patient.lastSignInAt, i18n.language)}
                    </Text>
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textMuted}
                    />
                  </View>
                </Pressable>
                {expanded ? <View style={styles.expandedWrap}>{renderExpanded(patient)}</View> : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  headerCell: {
    ...uiText(11, 'semiBold'),
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2F7',
  },
  dataRowExpanded: {
    backgroundColor: colors.cardSelectedBg,
  },
  cell: {
    justifyContent: 'center',
    gap: 4,
  },
  colPatient: { width: 150 },
  colStatus: { width: 88 },
  colProgress: { width: 88 },
  colLevel: { width: 96 },
  colCancer: { width: 120 },
  colSignIn: { width: 96 },
  signInCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  primaryText: {
    ...uiText(13, 'semiBold'),
    color: '#1E1E1E',
  },
  secondaryText: {
    ...uiText(11, 'regular'),
    color: colors.textMuted,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    ...uiText(11, 'semiBold'),
  },
  miniTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#EEF2F7',
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.buttonPrimary,
  },
  expandedWrap: {
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
});
