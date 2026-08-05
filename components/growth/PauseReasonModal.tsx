import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ProgressHoldType } from '../../lib/progressHold';
import { font } from '../../theme/fonts';

export type PauseReason = 'tired' | 'pain' | 'treatment' | 'unwell';

type Props = {
  visible: boolean;
  holdType: ProgressHoldType;
  onClose: () => void;
  onSelect: (reason: PauseReason) => void;
};

/**
 * Reason picker for Pause Progress or Quit Progress on Growth.
 * Tamil + English via i18n keys.
 */
export function PauseReasonModal({ visible, holdType, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const isQuit = holdType === 'quit';

  const options: { reason: PauseReason; label: string }[] = [
    { reason: 'tired', label: t('growth.pauseReasonTired') },
    { reason: 'pain', label: t('growth.pauseReasonPain') },
    { reason: 'treatment', label: t('growth.pauseReasonTreatment') },
    { reason: 'unwell', label: t('growth.pauseReasonUnwell') },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isQuit ? t('growth.quitReasonTitle') : t('growth.pauseReasonTitle')}
            </Text>
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

          <ScrollView
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={styles.subtitle}>
              {isQuit ? t('growth.quitReasonSubtitle') : t('growth.pauseReasonSubtitle')}
            </Text>

            <View style={styles.options}>
              {options.map((option) => (
                <Pressable
                  key={option.reason}
                  style={styles.optionButton}
                  onPress={() => onSelect(option.reason)}
                  accessibilityRole="button"
                >
                  <Text style={styles.optionText} numberOfLines={1}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
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
    maxWidth: 390,
    maxHeight: '86%',
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
    padding: 16,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 25,
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
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    color: '#374151',
    ...font('regular'),
  },
  options: {
    gap: 15,
    marginTop: 8,
  },
  optionButton: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0A0D12',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#414651',
    ...font('semiBold'),
  },
});
