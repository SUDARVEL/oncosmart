import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { font } from '../../theme/fonts';

export type PauseReason = 'tired' | 'pain' | 'treatment' | 'unwell';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (reason: PauseReason) => void;
};

/**
 * Figma "Reason for pausing your progress?" popup (3124:12545 / 3177:9710).
 * Shown when the patient taps Pause Progress on the Growth screen. Tamil + English.
 */
export function PauseReasonModal({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation();

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
            <Text style={styles.title}>{t('growth.pauseReasonTitle')}</Text>
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
            <Text style={styles.subtitle}>{t('growth.pauseReasonSubtitle')}</Text>

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
  /** Figma: white card, radius 16, SingleShadow-2 (0 4 6 rgba(17,24,39,.2)) */
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
  /** Figma Gray-Neutral/100 #374151, Roboto SemiBold 16 */
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
  /** Figma button: h44, radius 8, border #D5D7DA, Shadow/xs */
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
  /** Figma Gray/700 #414651, Roboto SemiBold 16 */
  optionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#414651',
    ...font('semiBold'),
  },
});
