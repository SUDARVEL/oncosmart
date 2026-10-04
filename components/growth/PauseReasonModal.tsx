import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { ProgressHoldType, PauseReason } from '../../lib/progressHold';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { AppTextInput } from '../AppTextInput';

export type { PauseReason };

type Props = {
  visible: boolean;
  holdType: ProgressHoldType;
  onClose: () => void;
  onSelect: (reason: PauseReason, note?: string) => void;
};

const PRESET_REASONS: { reason: Exclude<PauseReason, 'other'>; labelKey: string }[] = [
  { reason: 'tired', labelKey: 'growth.pauseReasonTired' },
  { reason: 'pain', labelKey: 'growth.pauseReasonPain' },
  { reason: 'treatment', labelKey: 'growth.pauseReasonTreatment' },
  { reason: 'unwell', labelKey: 'growth.pauseReasonUnwell' },
];

/**
 * Reason picker for Pause Progress on Growth.
 * Preset reasons submit immediately. "Any other" asks for a short note first.
 */
export function PauseReasonModal({ visible, holdType, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const isQuit = holdType === 'quit';
  const [otherOpen, setOtherOpen] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) {
      setOtherOpen(false);
      setNote('');
    }
  }, [visible]);

  const trimmedNote = note.trim();
  const canSaveOther = trimmedNote.length > 0;

  const submitOther = () => {
    if (!canSaveOther) return;
    onSelect('other', trimmedNote);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.subtitle}>
              {isQuit ? t('growth.quitReasonSubtitle') : t('growth.pauseReasonSubtitle')}
            </Text>

            <View style={styles.options}>
              {PRESET_REASONS.map((option) => (
                <Pressable
                  key={option.reason}
                  style={styles.optionButton}
                  onPress={() => onSelect(option.reason)}
                  accessibilityRole="button"
                >
                  <Text style={styles.optionText}>{t(option.labelKey)}</Text>
                </Pressable>
              ))}

              <Pressable
                style={[styles.optionButton, otherOpen && styles.optionButtonSelected]}
                onPress={() => setOtherOpen(true)}
                accessibilityRole="button"
                accessibilityState={{ selected: otherOpen }}
              >
                <Text style={[styles.optionText, otherOpen && styles.optionTextSelected]}>
                  {t('growth.pauseReasonOther')}
                </Text>
              </Pressable>

              {otherOpen ? (
                <View style={styles.otherBlock}>
                  <AppTextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder={t('growth.pauseReasonOtherPlaceholder')}
                    style={styles.noteInput}
                    multiline
                    maxLength={240}
                    textAlignVertical="top"
                    returnKeyType="done"
                    blurOnSubmit
                    onSubmitEditing={submitOther}
                    accessibilityLabel={t('growth.pauseReasonOther')}
                  />
                  <Pressable
                    style={[styles.saveButton, !canSaveOther && styles.saveButtonDisabled]}
                    onPress={submitOther}
                    disabled={!canSaveOther}
                    accessibilityRole="button"
                  >
                    <Text style={styles.saveButtonText}>{t('growth.pauseReasonOtherSave')}</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '88%',
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    ...font('semiBold'),
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    ...font('regular'),
  },
  options: {
    gap: 12,
  },
  optionButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    borderColor: colors.buttonPrimary,
    backgroundColor: colors.cardSelectedBg,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#414651',
    ...font('semiBold'),
  },
  optionTextSelected: {
    color: colors.buttonPrimary,
  },
  otherBlock: {
    gap: 12,
  },
  noteInput: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  saveButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },
  saveButtonText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
});
