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
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ProgressHoldType, PauseReason } from '../../lib/progressHold';
import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';
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
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
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
  const cardMaxHeight = windowHeight - insets.top - insets.bottom - 24;
  // Header stays fixed. The note footer (button included) stays fixed too,
  // so the option list is the only part that scrolls on a short phone.
  const scrollMaxHeight = Math.max(160, cardMaxHeight - (otherOpen ? 220 : 120));

  const submitOther = () => {
    if (!canSaveOther) return;
    onSelect('other', trimmedNote);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[
          styles.backdrop,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.card, { maxHeight: cardMaxHeight }]}>
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
            style={[styles.scroll, { maxHeight: scrollMaxHeight }]}
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
                </View>
              ) : null}
            </View>
          </ScrollView>

          {otherOpen ? (
            <View style={styles.footer}>
              <Pressable
                style={[styles.saveButton, !canSaveOther && styles.saveButtonDisabled]}
                onPress={submitOther}
                disabled={!canSaveOther}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSaveOther }}
              >
                <Text style={styles.saveButtonText}>{t('growth.pauseReasonOtherSave')}</Text>
              </Pressable>
            </View>
          ) : null}
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
    flexShrink: 1,
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
    color: '#374151',
    ...uiText(16, 'semiBold'),
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
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 16,
  },
  subtitle: {
    color: '#374151',
    ...uiText(15),
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
    color: '#414651',
    ...uiText(16, 'semiBold'),
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
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },
  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    ...uiText(15, 'semiBold'),
  },
});
