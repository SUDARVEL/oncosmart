import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { font } from '../../theme/fonts';

export type StopReason = 'tired' | 'pain' | 'exploring';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (reason: StopReason) => void;
};

export function WhyDidYouStopModal({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation();

  const options: { reason: StopReason; label: string }[] = [
    { reason: 'tired', label: t('sessionFlow.stopReasonTired') },
    { reason: 'pain', label: t('sessionFlow.stopReasonPain') },
    { reason: 'exploring', label: t('sessionFlow.stopReasonExploring') },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('sessionFlow.whyDidYouStop')}</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button">
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <View style={styles.body}>
            <Text style={styles.subtitle}>{t('sessionFlow.stopSubtitle')}</Text>

            <View style={styles.options}>
              {options.map((option) => (
                <Pressable
                  key={option.reason}
                  style={styles.optionButton}
                  onPress={() => onSelect(option.reason)}
                  accessibilityRole="button"
                >
                  <Text style={styles.optionText}>{option.label}</Text>
                </Pressable>
              ))}
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
    maxWidth: 394,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  },
  title: {
    fontSize: 20,
    color: '#374151',
    ...font('medium'),
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
    shadowColor: '#0A0D18',
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
