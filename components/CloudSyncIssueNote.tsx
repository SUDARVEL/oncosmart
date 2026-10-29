import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';

import { useOnlineStatus } from './OfflineBanner';
import { useAppStore } from '../store/useAppStore';
import { uiText } from '../theme/typography';

/**
 * Shown when the last cloud refresh failed for a reason other than the
 * phone being offline (the top banner already covers that).
 */
export function CloudSyncIssueNote() {
  const { t } = useTranslation();
  const ready = useAppStore((state) => state.cloudProfileReady);
  const issue = useAppStore((state) => state.cloudSyncIssue);
  const online = useOnlineStatus();

  if (!ready || !issue) return null;
  if (issue === 'offline' && online === false) return null;

  const message = issue === 'offline' ? t('errors.offline') : t('errors.loadFailed');
  return <Text style={styles.text}>{message}</Text>;
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
