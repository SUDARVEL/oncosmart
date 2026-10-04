import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { SessionFeedback } from '../../lib/sessionFeedback';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (feedback: SessionFeedback) => void;
};

const OPTIONS: { id: SessionFeedback; labelKey: string }[] = [
  { id: 'easy', labelKey: 'complete.feedbackEasy' },
  { id: 'hard', labelKey: 'complete.feedbackHard' },
  { id: 'tired', labelKey: 'complete.feedbackTired' },
];

/** Asked once after a session is saved. Choosing an option closes the sheet. */
export function SessionFeedbackModal({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('complete.feedbackTitle')}</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('pain.close')}
            >
              <Ionicons name="close" size={22} color="#374151" />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>{t('complete.feedbackSubtitle')}</Text>
          <View style={styles.options}>
            {OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                style={styles.optionButton}
                onPress={() => onSelect(option.id)}
                accessibilityRole="button"
              >
                <Text style={styles.optionText}>{t(option.labelKey)}</Text>
              </Pressable>
            ))}
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
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 26,
    color: '#1F2937',
    ...font('semiBold'),
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
    ...font('regular'),
  },
  options: {
    gap: 12,
    marginTop: 4,
  },
  optionButton: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    textAlign: 'center',
    ...font('semiBold'),
  },
});
