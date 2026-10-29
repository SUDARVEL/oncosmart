import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOnlineSnapshot, subscribeOnline } from '../lib/networkStatus';
import { uiText } from '../theme/typography';

function useOnlineStatus(): boolean | null {
  return useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineSnapshot);
}

/** Shown on every screen while the phone cannot reach the internet. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const { t } = useTranslation();
  if (online !== false) return null;

  return (
    <SafeAreaView edges={['top']} style={styles.banner}>
      <Text style={styles.text}>{t('errors.offline')}</Text>
    </SafeAreaView>
  );
}

export { useOnlineStatus };

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF2F2',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#FECACA',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  text: {
    ...uiText(14, 'medium'),
    color: '#B91C1C',
    textAlign: 'center',
    lineHeight: 20,
  },
});
