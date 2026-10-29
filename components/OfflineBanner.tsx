import { useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { getOnlineSnapshot, refreshOnline, subscribeOnline } from '../lib/networkStatus';
import { uiText } from '../theme/typography';

function useOnlineStatus(): boolean | null {
  return useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineSnapshot);
}

/** Gray full-screen notice while the phone cannot reach the internet. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);

  const onRetry = async () => {
    if (checking) return;
    setChecking(true);
    try {
      await refreshOnline();
    } finally {
      setChecking(false);
    }
  };

  return (
    <Modal
      visible={online === false}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        void onRetry();
      }}
    >
      <View style={styles.screen}>
        <Text style={styles.title}>{t('errors.offlineTitle')}</Text>
        <Text style={styles.hint}>{t('errors.offlineHint')}</Text>
        <Pressable
          style={[styles.button, checking && styles.buttonBusy]}
          onPress={() => void onRetry()}
          disabled={checking}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>
            {checking ? t('errors.retrying') : t('errors.offlineRetry')}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

export { useOnlineStatus };

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    ...uiText(18, 'bold'),
    color: '#111827',
    textAlign: 'center',
  },
  hint: {
    ...uiText(15),
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    marginTop: 22,
    minWidth: 112,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBusy: {
    opacity: 0.7,
  },
  buttonText: {
    ...uiText(15, 'medium'),
    color: '#FFFFFF',
  },
});
