import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineIllustration } from './OfflineIllustration';
import { getOnlineSnapshot, refreshOnline, subscribeOnline } from '../lib/networkStatus';
import { colors } from '../theme/colors';
import { uiText } from '../theme/typography';

function useOnlineStatus(): boolean | null {
  return useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineSnapshot);
}

/** The only no-internet screen. Other red offline messages stay hidden. */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (online !== false) setDismissed(false);
  }, [online]);

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
      visible={online === false && !dismissed}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => setDismissed(true)}
    >
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <Pressable
          style={styles.back}
          onPress={() => setDismissed(true)}
          accessibilityRole="button"
          accessibilityLabel={t('errors.offlineBack')}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>

        <View style={styles.body}>
          <OfflineIllustration />
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
      </SafeAreaView>
    </Modal>
  );
}

export { useOnlineStatus };

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  back: {
    marginLeft: 16,
    marginTop: 8,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 72,
  },
  title: {
    ...uiText(20, 'bold'),
    color: '#111827',
    textAlign: 'center',
    marginTop: 28,
  },
  hint: {
    ...uiText(15),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  button: {
    marginTop: 24,
    minWidth: 148,
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.buttonPrimary,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBusy: {
    opacity: 0.7,
  },
  buttonText: {
    ...uiText(16, 'medium'),
    color: colors.buttonPrimary,
  },
});
