import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { uiText } from '../theme/typography';

/**
 * Shown when the last cloud refresh failed for a reason other than the
 * phone being offline. The no-internet screen covers that case.
 */
export function CloudSyncIssueNote() {
  const { t } = useTranslation();
  const ready = useAppStore((state) => state.cloudProfileReady);
  const issue = useAppStore((state) => state.cloudSyncIssue);

  if (!ready || !issue || issue === 'offline') return null;

  return <Text style={styles.text}>{t('errors.loadFailed')}</Text>;
}

const styles = StyleSheet.create({
  text: {
    ...uiText(14, 'medium'),
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 12,
    marginHorizontal: 16,
  },
});
