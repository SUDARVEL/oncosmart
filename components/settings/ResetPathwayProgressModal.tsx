import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  visible: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ResetPathwayProgressModal({
  visible,
  busy = false,
  onCancel,
  onConfirm,
}: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('settings.resetPathwayProgressTitle')}</Text>
            <Pressable
              onPress={onCancel}
              disabled={busy}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('settings.resetPathwayProgressCancel')}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.body}>
            <Text style={styles.message}>{t('settings.resetPathwayProgressMessage')}</Text>

            <View style={styles.actions}>
              <Pressable
                style={[styles.primaryButton, busy && styles.buttonDisabled]}
                onPress={onConfirm}
                disabled={busy}
                accessibilityRole="button"
              >
                {busy ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryText}>{t('settings.resetPathwayProgressConfirm')}</Text>
                )}
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={onCancel}
                disabled={busy}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryText}>{t('settings.resetPathwayProgressCancel')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 362,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
    ...font('semiBold'),
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    ...font('regular'),
  },
  actions: {
    gap: 10,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryText: {
    fontSize: 15,
    color: '#FFFFFF',
    ...font('medium'),
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 15,
    color: colors.textMuted,
    ...font('medium'),
  },
});
