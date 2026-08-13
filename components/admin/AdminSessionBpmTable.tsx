import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { AdminSessionRow } from '../../lib/adminProgress';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  rows: AdminSessionRow[];
  formatWhen: (ms: number | null | undefined) => string;
};

function formatBpm(value: number | null, emptyLabel: string): string {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return String(value);
  }
  return emptyLabel;
}

export function AdminSessionBpmTable({ rows, formatWhen }: Props) {
  const { t } = useTranslation();
  const empty = t('admin.pauseReasonNone');

  if (rows.length === 0) {
    return <Text style={styles.empty}>{t('admin.noSessionsYet')}</Text>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.table}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.colLevel, styles.headerCell]}>
            {t('admin.bpmColLevel')}
          </Text>
          <Text style={[styles.cell, styles.colDay, styles.headerCell]}>
            {t('admin.bpmColDay')}
          </Text>
          <Text style={[styles.cell, styles.colBpm, styles.headerCell]}>
            {t('admin.bpmColStart')}
          </Text>
          <Text style={[styles.cell, styles.colBpm, styles.headerCell]}>
            {t('admin.bpmColEnd')}
          </Text>
          <Text style={[styles.cell, styles.colPain, styles.headerCell]}>
            {t('admin.bpmColPain')}
          </Text>
          <Text style={[styles.cell, styles.colWhen, styles.headerCell]}>
            {t('admin.bpmColCompleted')}
          </Text>
        </View>

        {rows.map((row) => (
          <View key={row.sessionKey} style={styles.row}>
            <Text style={[styles.cell, styles.colLevel]}>{row.level}</Text>
            <Text style={[styles.cell, styles.colDay]}>{row.dayInLevel}</Text>
            <Text style={[styles.cell, styles.colBpm, styles.bpmValue]}>
              {formatBpm(row.startBpm, empty)}
            </Text>
            <Text style={[styles.cell, styles.colBpm, styles.bpmValue]}>
              {formatBpm(row.endBpm, empty)}
            </Text>
            <Text style={[styles.cell, styles.colPain]}>
              {typeof row.painScore === 'number' ? `${row.painScore}/10` : empty}
            </Text>
            <Text style={[styles.cell, styles.colWhen]} numberOfLines={2}>
              {formatWhen(row.completedAt)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginTop: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 8,
    overflow: 'hidden',
    minWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.homeCardBg,
  },
  headerRow: {
    backgroundColor: colors.optionBg,
  },
  cell: {
    ...font('regular'),
    fontSize: 12,
    color: colors.textSecondary,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerCell: {
    ...font('semiBold'),
    fontSize: 11,
    color: colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  colLevel: {
    width: 44,
    textAlign: 'center',
  },
  colDay: {
    width: 44,
    textAlign: 'center',
  },
  colBpm: {
    width: 72,
    textAlign: 'center',
  },
  colPain: {
    width: 56,
    textAlign: 'center',
  },
  colWhen: {
    width: 128,
    textAlign: 'left',
  },
  bpmValue: {
    ...font('semiBold'),
    color: colors.navy,
  },
  empty: {
    ...font('regular'),
    fontSize: 13,
    color: colors.textMuted,
  },
});
