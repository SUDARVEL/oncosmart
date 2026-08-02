import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  visible: boolean;
  onClose: () => void;
  /** Optional: jump back to Growth and resume in one tap. */
  onResume?: () => void;
};

/**
 * Shown when the patient tries to start/open an exercise while progress is paused.
 */
export function ResumeProgressModal({ visible, onClose, onResume }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('growth.progressPaused')}</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('pain.close')}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.body}>
            <Text style={styles.message}>{t('growth.resumeToContinue')}</Text>

            <View style={styles.actions}>
              {onResume ? (
                <Pressable
                  style={styles.primaryButton}
                  onPress={onResume}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryText}>{t('growth.resumeProgress')}</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={onResume ? styles.secondaryButton : styles.primaryButton}
                onPress={onClose}
                accessibilityRole="button"
              >
                <Text style={onResume ? styles.secondaryText : styles.primaryText}>
                  {t('growth.resumeToContinueOk')}
                </Text>
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
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    flex: 1,
    paddingRight: 8,
    fontSize: 16,
    color: '#374151',
    ...font('semiBold'),
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    color: '#374151',
    textAlign: 'center',
    ...font('regular'),
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryText: {
    fontSize: 16,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
  secondaryButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D7DA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryText: {
    fontSize: 16,
    color: '#414651',
    ...font('semiBold'),
  },
});
